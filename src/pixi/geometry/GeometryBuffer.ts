namespace gobi.pixi {
	import GLBuffer = gobi.glCore.GLBuffer;
	export class GeometryBuffer implements UniqIdMarked {
		data: TypedArrayLike;
		index: boolean;
		_static: boolean;
		uniqId: number = UniqIdGenerator.getUniq();

		_glBuffers: { [key: number]: GLBuffer } = {};
		_updateID = 0;

		/**
		 * @param {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} data the data to store in the buffer.
		 */
		constructor(data?: TypedArrayLike, _static = true, index = false) {
			/**
			 * The data in the buffer, as a typed array
			 *
			 * @type {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} data  the array / typedArray
			 */
			this.data = data || new Float32Array(1);


			this.index = index;

			this._static = _static;
		}

		// TODO could explore flagging only a partial upload?
		/**
		 * flags this buffer as requiring an upload to the GPU
		 */
		update(data?: TypedArrayLike) {
			this.data = data || this.data;
			this._updateID++;
		}

		/**
		 * Destroys the buffer
		 */
		destroy() {
			for (let i in this._glBuffers) {
				this._glBuffers[i].destroy();
			}

			this.data = null;
		}

		/**
		 * Helper function that creates a buffer based on an array or TypedArray
		 *
		 * @static
		 * @param {TypedArray| Array} data the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
		 * @return {PIXI.mesh.Buffer} A new Buffer based on the data provided.
		 */
		static from(data: any) {
			if (data instanceof Array || data instanceof ArrayBuffer) {
				data = new Float32Array(data as Array<number>);
			}

			return new GeometryBuffer(data);
		}
	}
}
