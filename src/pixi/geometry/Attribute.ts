namespace gobi.pixi {
	export class Attribute {
		bufferIndex: number;
		size: number;
		normalized: boolean;
		type: gobi.core.TYPES;
		stride: number;
		start: number;
		instanceDivisor: number;

		/**
		 * @param {string} buffer  the id of the buffer that this attribute will look for
		 * @param {Number} [size=0] the size of the attribute. If you hava 2 floats per vertex (eg position x and y) this would be 2.
		 * @param {Boolean} [normalised=false] should the data be normalised.
		 * @param {Number} [type=PIXI.TYPES.FLOAT] what type of numbe is the attribute. Check {PIXI.TYPES} to see the ones available
		 * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
		 * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
		 */
		constructor(bufferIndex: number, size: number, normalized = false, type = gobi.core.TYPES.FLOAT, stride: number, start: number, instance: number) {
			this.bufferIndex = bufferIndex;
			this.size = size;
			this.normalized = normalized;
			this.type = type;
			this.stride = stride;
			this.start = start;
			this.instanceDivisor = instance;
		}
	}
}
