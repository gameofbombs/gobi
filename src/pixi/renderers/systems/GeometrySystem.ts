interface WebGLRenderingContext {
	drawArraysInstanced(mode: number, first: number, count: number, primcount: number): void;
	drawElementsInstanced(mode: number, count: number, type: number, offset: number, primcount: number): void;
	vertexAttribDivisor(index: number, divisor: number): void;

	createVertexArray(): WebGLVertexArrayObjectOES | null;
	deleteVertexArray(arrayObject: WebGLVertexArrayObjectOES | null): void;
	bindVertexArray(arrayObject: WebGLVertexArrayObjectOES | null): void;
}

namespace gobi.pixi.systems {
	import GLBuffer = gobi.glCore.GLBuffer;
	import VertexArrayObject = gobi.glCore.VertexArrayObject;
	const byteSizeMap: any = {5126: 4, 5123: 2, 5121: 1};

	let FALLBACK_VAO_ID = 0;

	//TODO : VAO for webgl1

	/**
	 * @class
	 * @extends PIXI.WebGLSystem
	 * @memberof PIXI
	 */
	export class GeometrySystem extends BaseSystem {
		_activeGeometry: Geometry = null;
		_activeVao: VertexArrayObject = null;
		hasVao = true;
		hasInstance = true;
		hasVaoInstance = true;

		gl: WebGLRenderingContext;
		CONTEXT_UID: number;

		//fallback
		_fallbackDivisors: Array<number> = [];
		_fallbackAttributes: Array<number> = [];
		_fallbackMaxLocation: number = 0;

		/**
		 * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
		 */
		constructor(renderer: WebGLRenderer) {
			super(renderer);
		}

		/**
		 * Sets up the renderer context and necessary buffers.
		 *
		 * @private
		 */
		contextChange() {
			this.removeAll(true);

			this._activeVao = null;
			this._activeGeometry = null;
			this._fallbackDivisors.length = 0;
			this._fallbackAttributes.length = 0;
			this._fallbackMaxLocation = 0;

			const gl = this.gl = this.renderer.gl;
			const anygl = gl as any;

			this.CONTEXT_UID = this.renderer.CONTEXT_UID;

			// webgl2
			if (!anygl.createVertexArray || anygl.hackedVao) {
				// this.hasVaoInstance = false;

				// webgl 1!
				let nativeVaoExtension = this.renderer.context.extensions.vertexArrayObject;

				if (this.renderer.legacy) {
					nativeVaoExtension = null;
				}

				if (nativeVaoExtension) {
					anygl.createVertexArray = () =>
						nativeVaoExtension.createVertexArrayOES();

					anygl.bindVertexArray = (vao: any) =>
						nativeVaoExtension.bindVertexArrayOES(vao);

					anygl.deleteVertexArray = (vao: any) =>
						nativeVaoExtension.deleteVertexArrayOES(vao);
				}
				else {
					this.hasVao = false;
					anygl.createVertexArray = () => {
						return 1;
						// empty
					};

					anygl.bindVertexArray = () => {
						// empty
					};

					anygl.deleteVertexArray = () => {
						// empty
					};
				}
				anygl.hackedVao = true;
			}

			if (!anygl.vertexAttribDivisor || anygl.hackedInstanced) {
				const instanceExt = gl.getExtension('ANGLE_instanced_arrays');

				if (instanceExt) {
					anygl.vertexAttribDivisor = (a: any, b: any) =>
						instanceExt.vertexAttribDivisorANGLE(a, b);

					anygl.drawElementsInstanced = (a: any, b: any, c: any, d: any, e: any) =>
						instanceExt.drawElementsInstancedANGLE(a, b, c, d, e);

					anygl.drawArraysInstanced = (a: any, b: any, c: any, d: any) =>
						instanceExt.drawArraysInstancedANGLE(a, b, c, d);

					anygl.hackedInstanced = true;
				}
			}
		}

		/**
		 * Binds geometry so that is can be drawn. Creating a Vao if required
		 * @private
		 * @param {PIXI.mesh.Geometry} geometry instance of geometry to bind
		 */
		bind(geometry: Geometry, shader?: Shader) {
			shader = shader || this.renderer.shader.shader;

			const gl = this.gl;

			// not sure the best way to address this..
			// currently different shaders require different VAOs for the same geometry
			// Still mulling over the best way to solve this one..
			// will likely need to modify the shader attribute locations at run time!
			let vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];

			if (!vaos) {
				vaos = this.initGeometry(geometry);
			}

			const vao = vaos[shader.program.uniqId] || this.initGeometryVao(geometry, shader.program);

			this._activeGeometry = geometry;

			if (this._activeVao !== vao) {
				this._activeVao = vao;

				if (this.hasVao) {
					gl.bindVertexArray(vao);
				}
				else {
					this.activateVao(geometry, shader.program);
				}
			}

			// TODO - optimise later!
			// don't need to loop through if nothing changed!
			// maybe look to add an 'autoupdate' to geometry?
			this.updateBuffers();
		}

		updateBuffers() {
			const geometry = this._activeGeometry;
			const gl = this.gl;

			for (let i = 0; i < geometry.buffers.length; i++) {
				const buffer = geometry.buffers[i];

				const glBuffer = buffer._glBuffers[this.CONTEXT_UID];

				if (glBuffer.updateID !== buffer._updateID) {
					glBuffer.updateID = buffer._updateID;

					// TODO can cache this on buffer! maybe added a getter / setter?
					const type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
					const drawType = buffer._static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

					gl.bindBuffer(type, glBuffer.buffer);

					if (glBuffer.byteLength >= buffer.data.byteLength) {
						// offset is always zero for now!
						gl.bufferSubData(type, 0, buffer.data);
					}
					else {
						gl.bufferData(type, buffer.data, drawType);
						glBuffer.byteLength = buffer.data.byteLength;
					}
				}
			}
		}

		checkCompatability(geometry: Geometry, program: Program) {
			// geometry must have at least all the attributes that the shader requires.
			const geometryAttributes = geometry.attributes;
			const shaderAttributes = program.attributeData;

			for (const j in shaderAttributes) {
				if (!geometryAttributes[j]) {
					throw new Error(`shader and geometry incompatible, geometry missing the "${j}" attribute`);
				}
			}
		}

		/**
		 * Creates a Vao with the same structure as the geometry and stores it on the geometry.
		 * @private
		 * @param {PIXI.mesh.Geometry} geometry instance of geometry to to generate Vao for
		 */
		initGeometryVao(geometry: Geometry, program: Program) {
			this.checkCompatability(geometry, program);

			const gl = this.gl;
			const CONTEXT_UID = this.CONTEXT_UID;
			const buffers = geometry.buffers;
			const attributes = geometry.attributes;

			const tempStride: { [key: number]: number } = {};
			const tempStart: { [key: number]: number } = {};

			for (const j in buffers) {
				tempStride[j] = 0;
				tempStart[j] = 0;
			}

			for (const j in attributes) {
				if (!attributes[j].size && program.attributeData[j]) {
					attributes[j].size = program.attributeData[j].size;
				}

				tempStride[attributes[j].bufferIndex] += attributes[j].size * byteSizeMap[attributes[j].type];
			}

			for (const j in attributes) {
				const attribute = attributes[j];
				const attribSize = attribute.size;

				if (attribute.stride === undefined) {
					if (tempStride[attribute.bufferIndex] === attribSize * byteSizeMap[attribute.type]) {
						attribute.stride = 0;
					}
					else {
						attribute.stride = tempStride[attribute.bufferIndex];
					}
				}

				if (attribute.start === undefined) {
					attribute.start = tempStart[attribute.bufferIndex];

					tempStart[attribute.bufferIndex] += attribSize * byteSizeMap[attribute.type];
				}
			}

			// first update - and create the buffers!
			// only create a gl buffer if it actually gets
			for (let i = 0; i < buffers.length; i++) {
				const buffer = buffers[i];

				if (!buffer._glBuffers[CONTEXT_UID]) {
					this.initBuffer(buffer);
				}
			}

			if (!this.hasVao) {
				++FALLBACK_VAO_ID;
				geometry.glVertexArrayObjects[this.CONTEXT_UID][program.uniqId] = FALLBACK_VAO_ID;
				return FALLBACK_VAO_ID;
			}

			// TODO - maybe make this a data object?
			// lets wait to see if we need to first!
			const vao = gl.createVertexArray();

			gl.bindVertexArray(vao);

			this.activateVao(geometry, program);

			gl.bindVertexArray(null);

			// add it to the cache!
			geometry.glVertexArrayObjects[this.CONTEXT_UID][program.uniqId] = vao;

			return vao;
		}

		activateVao(geometry: Geometry, program: Program) {
			const gl = this.gl;
			const CONTEXT_UID = this.CONTEXT_UID;
			const buffers = geometry.buffers;
			const attributes = geometry.attributes;

			if (geometry.indexBuffer) {
				// first update the index buffer if we have one..
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer._glBuffers[CONTEXT_UID].buffer);
			}

			let lastBuffer = null;

			let maxLocation = 0;

			const fallbackDivisors = this._fallbackDivisors;
			const fallbackAttributes = this._fallbackAttributes;
			const hasVao = this.hasVao;
			const hasVaoInstance = this.hasVaoInstance;

			// add a new one!
			for (const j in attributes) {
				const attribute = attributes[j];
				const buffer = buffers[attribute.bufferIndex];
				const glBuffer = buffer._glBuffers[CONTEXT_UID];

				if (program.attributeData[j]) {
					if (lastBuffer !== glBuffer) {
						gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.buffer);

						lastBuffer = glBuffer;
					}

					const location = program.attributeData[j].location;
					maxLocation = Math.max(maxLocation, location);

					while (location >= fallbackDivisors.length) {
						fallbackDivisors.push(0);
						fallbackAttributes.push(0);
					}

					// TODO introduce state again
					// we can optimise this for older devices that have no VAOs
					if (hasVao) {
						gl.enableVertexAttribArray(location);
					} else {
						if (fallbackAttributes[location] === 0) {
							gl.enableVertexAttribArray(location);
						}
						fallbackAttributes[location] = 2;
					}

					gl.vertexAttribPointer(location,
						attribute.size,
						attribute.type || gl.FLOAT,
						attribute.normalized,
						attribute.stride,
						attribute.start);

					if (hasVaoInstance) {
						if (attribute.instanceDivisor) {
							gl.vertexAttribDivisor(location, attribute.instanceDivisor);
						}
					} else {

						if (attribute.instanceDivisor) {
							// TODO calculate instance count based of this...
							if (this.hasInstance) {
								gl.vertexAttribDivisor(location, attribute.instanceDivisor);
								fallbackDivisors[location] = attribute.instanceDivisor;
							}
							else {
								throw new Error('geometry error, GPU Instancing is not supported on this device');
							}
						} else {
							if (fallbackDivisors[location] !== 0) {
								gl.vertexAttribDivisor(location, 0);
								fallbackDivisors[location] = 0;
							}
						}
					}
				}
			}

			if (!hasVao) {
				for (let i = Math.max(this._fallbackMaxLocation, maxLocation); i >= 0; --i) {
					if (fallbackAttributes[i] === 1) {
						gl.disableVertexAttribArray(i);
						fallbackAttributes[i] = 0;
					} else if (fallbackAttributes[i] === 2) {
						fallbackAttributes[i] = 1;
					}
				}
			}
			this._fallbackMaxLocation = maxLocation;
		}

		draw(type: number, size: number, start?: number, instanceCount?: number) {
			const gl = this.gl;
			const geometry = this._activeGeometry;

			// TODO.. this should not change so maybe cache the function?

			if (geometry.indexBuffer) {
				if (geometry.instanced) {
					/* eslint-disable max-len */
					gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2, instanceCount || 1);
					/* eslint-enable max-len */
				}
				else {
					gl.drawElements(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2);
				}
			}
			else if (geometry.instanced) {
				// TODO need a better way to calculate size..
				gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1);
			}
			else {
				gl.drawArrays(type, start, size || geometry.getSize());
			}

			return this;
		}

		/**
		 * Its a hack
		 * Suppose that correct program, geometry and buffer is already bound, and we want to change only attribute start
		 *
		 * @param geometry
		 * @param program
		 * @param key
		 * @param start
		 */
		hackAttribStart(geometry: Geometry, program: Program, key: string, start: number) {
			const gl = this.gl;

			const attr = geometry.attributes[key];
			const glAttr = program.attributeData[key];

			start = start * attr.stride + attr.start;

			if (attr && glAttr) {
				gl.vertexAttribPointer(glAttr.location,
					attr.size,
					attr.type || gl.FLOAT,
					attr.normalized,
					attr.stride,
					start);
			}
		}

		managedBuffers: { [key: number]: GeometryBuffer } = {};

		initBuffer(buffer: GeometryBuffer) {
			const glBuffer = new GLBuffer(this.gl);
			buffer._glBuffers[this.CONTEXT_UID] = glBuffer;

			this.managedBuffers[buffer.uniqId] = buffer;
			buffer.onDispose.addListener(this.destroyBuffer);

			return glBuffer;
		}

		destroyBuffer = (buffer: GeometryBuffer, contextLost: boolean = false) => {
			const glBuffer = buffer._glBuffers[this.CONTEXT_UID];
			delete this.managedBuffers[buffer.uniqId];
			if (glBuffer) {
				if (!contextLost) {
					glBuffer.destroy();
				}
				buffer.onDispose.removeListener(this.destroyBuffer);
				delete buffer._glBuffers[this.CONTEXT_UID];
			}
		};

		managedGeometries: { [key: number]: Geometry } = {};

		initGeometry(geom: Geometry) {
			const vaos: { [key: number]: any } = {};
			geom.glVertexArrayObjects[this.CONTEXT_UID] = vaos;

			this.managedGeometries[geom.uniqId] = geom;
			geom.onDispose.addListener(this.destroyGeometry);

			return vaos;
		}

		destroyGeometry = (geom: Geometry, contextLost: boolean = false) => {
			delete this.managedGeometries[geom.uniqId];
			const vaos = geom.glVertexArrayObjects[this.CONTEXT_UID];

			if (vaos) {
				if (!contextLost) {
					if (!this.hasVao) {
						for (let key in vaos) {
							this.gl.deleteVertexArray(vaos[key]);
						}
					}
				}
				geom.onDispose.removeListener(this.destroyGeometry);
				delete geom.glVertexArrayObjects[this.CONTEXT_UID];
			}
		};

		removeAll(contextLost: boolean = false) {
			let all = Object.keys(this.managedGeometries);
			for (let key of all) {
				this.destroyGeometry(this.managedGeometries[key as any], contextLost);
			}
			all = Object.keys(this.managedBuffers);
			for (let key of all) {
				this.destroyBuffer(this.managedBuffers[key as any], contextLost);
			}
		}
	}
}
