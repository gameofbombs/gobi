namespace gobi.pixi.systems {
	import BlendMode = gobi.core.BlendMode;
	export enum STATE_PROPS {
		BLEND = 0,
		OFFSET = 1,
		CULLING = 2,
		DEPTH_TEST = 3,
		WINDING = 4,
	}

	import GLState = gobi.glCore.GLState;
	import GLAttribState = gobi.glCore.GLAttribState;
	import DEPTH_MODE = gobi.core.DEPTH_MODE;

	/**
	 * A WebGL state machines
	 *
	 * @memberof PIXI
	 * @class
	 */
	export class StateSystem extends BaseSystem {
		gl: WebGLRenderingContext;
		maxAttribs: number = null;

		nativeVaoExtension: OESVertexArrayObject = null;
		floatTextureExtension: OESTextureFloat = null;
		attribState: GLAttribState = null;

		stateId: number = 0;
		map: [(value: boolean) => void] = [this.setBlend, this.setOffset,
			this.setCullFace, this.setDepthTest, this.setFrontFace];

		defaultState = new GLState();
		blendMode = BlendMode.NONE;

		constructor(renderer: WebGLRenderer) {
			super(renderer);

			this.stateId = 0;

			this.defaultState = new GLState();
			this.defaultState.blend = true;
			// this.defaultState.depthTest = true;
		}

		contextChange(gl: WebGLRenderingContext) {
			this.gl = gl;

			this.maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

			// check we have vao..
			this.nativeVaoExtension = (
				gl.getExtension('OES_vertex_array_object')
				|| gl.getExtension('MOZ_OES_vertex_array_object')
				|| gl.getExtension('WEBKIT_OES_vertex_array_object')
			);

			this.attribState = new GLAttribState(this.maxAttribs);

			this.setState(this.defaultState);

			this.reset();
		}

		/**
		 * Sets the current state
		 *
		 * @param {*} state - The state to set.
		 */
		setState(state: GLState) {
			state = state || this.defaultState;

			// TODO maybe to an object check? ( this.state === state )?
			if (this.stateId !== state.data) {
				let diff = this.stateId ^ state.data;
				let i = 0;

				// order from least to most common
				while (diff) {
					if (diff & 1) {
						// state change!
						this.map[i].call(this, !!(state.data & (1 << i)));
					}

					diff = diff >> 1;
					i++;
				}

				this.stateId = state.data;
			}
		}

		/**
		 * Enables or disabled blending.
		 *
		 * @param {boolean} value - Turn on or off webgl blending.
		 */
		setBlend(value: boolean): void {
			this.gl[value ? 'enable' : 'disable'](this.gl.BLEND);
		}

		/**
		 * Enables or disable polygon offset fill
		 *
		 * @param {boolean} value - Turn on or off webgl polygon offset testing.
		 */
		setOffset(value: boolean): void {
			this.gl[value ? 'enable' : 'disable'](this.gl.POLYGON_OFFSET_FILL);
		}

		/**
		 * Sets whether to enable or disable depth test.
		 *
		 * @param {boolean} value - Turn on or off webgl depth testing.
		 */
		setDepthTest(value: boolean): void {
			this.gl[value ? 'enable' : 'disable'](this.gl.DEPTH_TEST);
		}

		/**
		 * Sets whether to enable or disable cull face.
		 *
		 * @param {boolean} value - Turn on or off webgl cull face.
		 */
		setCullFace(value: boolean): void {
			this.gl[value ? 'enable' : 'disable'](this.gl.CULL_FACE);
		}

		/**
		 * Sets the gl front face.
		 *
		 * @param {boolean} value - true is clockwise and false is counter-clockwise
		 */
		setFrontFace(value: boolean): void {
			this.gl.frontFace(this.gl[value ? 'CW' : 'CCW']);
		}

		/**
		 * Sets the blend mode.
		 *
		 * @param {number} value - The blend mode to set to.
		 */
		setBlendMode(value: BlendMode): void {
			if (value === this.blendMode) {
				return;
			}

			this.blendMode = value;

			this.gl.blendFuncSeparate(value.srcRGB, value.dstRGB, value.srcAlpha, value.dstAlpha);
			this.gl.blendEquationSeparate(value.modeRGB, value.modeAlpha);
		}

		/**
		 * Sets the polygon offset.
		 *
		 * @param {number} value - the polygon offset
		 * @param {number} scale - the polygon offset scale
		 */
		setPolygonOffset(value: number, scale: number) {
			this.gl.polygonOffset(value, scale);
		}

		/**
		 * Disables all the vaos in use
		 *
		 */
		resetAttributes() {
			for (let i = 0; i < this.attribState.tempAttribState.length; i++) {
				this.attribState.tempAttribState[i] = 0;
			}

			for (let i = 0; i < this.attribState.attribState.length; i++) {
				this.attribState.attribState[i] = 0;
			}

			// im going to assume one is always active for performance reasons.
			for (let i = 1; i < this.maxAttribs; i++) {
				this.gl.disableVertexAttribArray(i);
			}
		}

		// used
		/**
		 * Resets all the logic and disables the vaos
		 */
		reset() {
			// unbind any VAO if they exist..
			if (this.nativeVaoExtension) {
				this.nativeVaoExtension.bindVertexArrayOES(null);
			}

			// reset all attributes..
			this.resetAttributes();

			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

			this.blendMode = BlendMode.NONE;
			this.stateId = this.defaultState.data ^ 31;

			this.setBlendMode(BlendMode.NORMAL);

			this.setState(this.defaultState);
		}

		//hacks!

		depthMode = DEPTH_MODE.DEFAULT;

		setDepthMode(value: number) {
			if (value === this.depthMode) {
				return;
			}
			this.renderer.batch.flush();
			//TODO: move to renderTarget?
			const gl = this.gl;
			if (value === DEPTH_MODE.FRONT_TO_BACK) {
				gl.enable(gl.DEPTH_TEST);
				gl.depthFunc(gl.LEQUAL);
				gl.depthRange(-1, 1);
				gl.clear(gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

				gl.colorMask(false, false, false, false);
				gl.depthMask(true);
			} else if (value === DEPTH_MODE.BACK_TO_FRONT) {
				gl.enable(gl.DEPTH_TEST);
				gl.colorMask(true, true, true, true);
				gl.depthMask(false);
			} else {
				gl.disable(gl.DEPTH_TEST);
			}
			this.depthMode = value;
		}
	}
}

