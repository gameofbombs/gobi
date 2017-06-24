interface TypedArrayLike extends ArrayLike<number> {
	byteLength: number;
	[n: number]: number;
	set(x: ArrayLike<number>, offset?: number): void;
	slice(start?: number, end?: number): TypedArrayLike;
}

interface Float32Array extends TypedArrayLike {
}
interface Int32Array extends TypedArrayLike {
}
interface Uint32Array extends TypedArrayLike {
}
interface Int16Array extends TypedArrayLike {
}

namespace gobi.utils {
	const map: any = {Float32Array: Float32Array, Uint32Array: Uint32Array, Int32Array: Int32Array};

	export function interleaveTypedArrays(arrays: Array<TypedArrayLike>, sizes: Array<number>) {
		let outSize = 0;
		let stride = 0;
		const views: { [key: string]: TypedArrayLike } = {};

		for (let i = 0; i < arrays.length; i++) {
			stride += sizes[i];
			outSize += arrays[i].length;
		}

		const buffer = new ArrayBuffer(outSize * 4);

		let out = null;
		let littleOffset = 0;

		for (let i = 0; i < arrays.length; i++) {
			const size = sizes[i];
			const array = arrays[i];

			const type = getBufferType(array);

			if (!views[type]) {
				views[type] = new map[type](buffer);
			}

			out = views[type];

			for (let j = 0; j < array.length; j++) {
				const indexStart = ((j / size | 0) * stride) + littleOffset;
				const index = j % size;

				out[indexStart + index] = array[j];
			}

			littleOffset += size;
		}

		return new Float32Array(buffer);
	}

	export function getBufferType(array: any): string {
		if (array.BYTES_PER_ELEMENT === 4) {
			if (array instanceof Float32Array) {
				return 'Float32Array';
			}
			else if (array instanceof Uint32Array) {
				return 'Uint32Array';
			}

			return 'Int32Array';
		}
		else if (array.BYTES_PER_ELEMENT === 2) {
			if (array instanceof Uint16Array) {
				return 'Uint16Array';
			}
		}

		// TODO map out the rest of the array elements!
		return null;
	}

	export function createIndicesForQuads(size: number) {
		// the total number of indices in our array, there are 6 points per quad.

		const totalIndices = size * 6;

		const indices = new Uint16Array(totalIndices);

		// fill the indices with the quads to draw
		for (let i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
			indices[i + 0] = j + 0;
			indices[i + 1] = j + 1;
			indices[i + 2] = j + 2;
			indices[i + 3] = j + 0;
			indices[i + 4] = j + 2;
			indices[i + 5] = j + 3;
		}

		return indices;
	}
}