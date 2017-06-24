let EMPTY_ARRAY_BUFFER = new ArrayBuffer(0);

namespace gobi.glCore {
	/**
	 * Helper class to create a webGL buffer
	 *
	 * @class
	 * @memberof PIXI.glCore
	 * @param gl {WebGLRenderingContext} The current WebGL rendering context
	 * @param type {gl.ARRAY_BUFFER | gl.ELEMENT_ARRAY_BUFFER} @mat
	 * @param data {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} an array of data
	 * @param drawType {gl.STATIC_DRAW|gl.DYNAMIC_DRAW|gl.STREAM_DRAW}
	 */
	export class GLBuffer {
		updateID = -1;
		byteLength = -1;
		gl: WebGLRenderingContext;
		buffer: WebGLBuffer;

		constructor(gl: WebGLRenderingContext) {
			this.gl = gl;

			this.buffer = gl.createBuffer();
		}

		destroy() {
			this.gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}
	}
}
