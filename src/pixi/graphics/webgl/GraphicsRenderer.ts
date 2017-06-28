///ts:ref=BatchSystem
/// <reference path="../../renderers/systems/BatchSystem.ts"/> ///ts:ref:generated
///ts:ref=WebGLRenderer
/// <reference path="../../renderers/WebGLRenderer.ts"/> ///ts:ref:generated

namespace gobi.pixi.graphicsUtils {
	/**
	 * Renders the graphics object.
	 *
	 * @class
	 * @memberof PIXI
	 * @extends PIXI.ObjectRenderer
	 */
	export class GraphicsRenderer extends ObjectRenderer {

		graphicsDataPool: Array<WebGLGraphicsData> = [];
		primitiveShader = new gobi.pixi.graphics.PrimitiveShader();
		gl: WebGLRenderingContext = null;
		CONTEXT_UID: number = 0;

		/**
		 * @param {PIXI.WebGLRenderer} renderer - The renderer this object renderer works for.
		 */
		constructor(renderer: WebGLRenderer) {
			super(renderer);
		}

		/**
		 * Called when there is a WebGL context change
		 *
		 * @private
		 *
		 */
		onContextChange() {
			this.gl = this.renderer.gl;
			this.CONTEXT_UID = this.renderer.CONTEXT_UID;
		}

		/**
		 * Destroys this renderer.
		 *
		 */
		destroy() {
			for (let i = 0; i < this.graphicsDataPool.length; ++i) {
				this.graphicsDataPool[i].destroy();
			}

			this.graphicsDataPool = null;
		}

		/**
		 * Renders a graphics object.
		 *
		 * @param {PIXI.Graphics} graphics - The graphics object to render.
		 */
		render(graphics: GraphicsDisplayObject) {
			const renderer = this.renderer;
			const gl = renderer.gl;
			const node = graphics.node;

			let webGLData;
			let webGL = graphics._webGL[this.CONTEXT_UID];

			if (!webGL || graphics.dirty !== webGL.dirty) {
				this.updateGraphics(graphics);

				webGL = graphics._webGL[this.CONTEXT_UID];
			}

			// This  could be speeded up for sure!
			const shader = this.primitiveShader;

			renderer.state.setBlendMode(graphics.blendMode);

			for (let i = 0, n = webGL.data.length; i < n; i++) {
				webGLData = webGL.data[i];

				shader.uniforms.translationMatrix = node.transform.worldTransform.toArray(true);
				shader.uniforms.tint = node.tintRgba;
				//shader.uniforms.tint = hex2rgb(node.tint);
				shader.uniforms.alpha = node.tintRgba[3];

				renderer.shader.bind(shader);
				renderer.geometry.bind(webGLData.geometry);

				if (graphics.nativeLines) {
					renderer.geometry.draw(gl.LINES, webGLData.indices.length / 6);
				}
				else {
					renderer.geometry.draw(gl.TRIANGLE_STRIP, webGLData.indices.length);
				}
			}
		}

		/**
		 * Updates the graphics object
		 *
		 * @private
		 * @param {PIXI.Graphics} graphics - The graphics object to update
		 */
		updateGraphics(graphics: GraphicsDisplayObject) {
			const gl = this.renderer.gl;

			// get the contexts graphics object
			let webGL = graphics._webGL[this.CONTEXT_UID];

			// if the graphics object does not exist in the webGL context time to create it!
			if (!webGL) {
				webGL = graphics._webGL[this.CONTEXT_UID] = new WebGLGraphics(gl);
			}

			// flag the graphics as not dirty as we are about to update it...
			webGL.dirty = graphics.dirty;

			// if the user cleared the graphics object we will need to clear every object
			if (graphics.clearDirty !== webGL.clearDirty) {
				webGL.clearDirty = graphics.clearDirty;

				// loop through and return all the webGLDatas to the object pool so than can be reused later on
				for (let i = 0; i < webGL.data.length; i++) {
					this.graphicsDataPool.push(webGL.data[i]);
				}

				// clear the array and reset the index..
				webGL.data.length = 0;
				webGL.lastIndex = 0;
			}

			let webGLData: WebGLGraphicsData;

			// loop through the graphics datas and construct each one..
			// if the object is a complex fill then the new stencil buffer technique will be used
			// other wise graphics objects will be pushed into a batch..
			for (let i = webGL.lastIndex; i < graphics.graphicsData.length; i++) {
				const data = graphics.graphicsData[i];

				// TODO - this can be simplified
				webGLData = this.getWebGLData(webGL, 0);

				if (data.type === SHAPES.POLY) {
					buildPoly(data, webGLData);
				}
				if (data.type === SHAPES.RECT) {
					buildRectangle(data, webGLData);
				}
				else if (data.type === SHAPES.CIRC || data.type === SHAPES.ELIP) {
					buildCircle(data, webGLData);
				}
				else if (data.type === SHAPES.RREC) {
					buildRoundedRectangle(data, webGLData);
				}

				webGL.lastIndex++;
			}

			// this.renderer.geometry.bindVao(null);

			// upload all the dirty data...
			for (let i = 0; i < webGL.data.length; i++) {
				webGLData = webGL.data[i];

				if (webGLData.dirty) {
					webGLData.upload();
				}
			}
		}

		/**
		 *
		 * @private
		 * @param {WebGLRenderingContext} gl - the current WebGL drawing context
		 * @param {number} type - TODO @Alvin
		 * @return {*} TODO
		 */
		getWebGLData(gl: WebGLGraphics, type?: number) {
			let webGLData = gl.data[gl.data.length - 1];

			if (!webGLData || webGLData.points.length > 320000) {
				webGLData = this.graphicsDataPool.pop()
					|| new WebGLGraphicsData(this.renderer.gl,
						this.primitiveShader);

				webGLData.reset(/*type*/);
				gl.data.push(webGLData);
			}

			webGLData.dirty = true;

			return webGLData;
		}
	}

	WebGLRenderer.registerPlugin('graphics', GraphicsRenderer);
}
