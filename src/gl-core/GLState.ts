/* eslint-disable max-len */

namespace gobi.glCore {
	import BlendMode = gobi.core.BlendMode;

	const BLEND_BIT = 0;
	const OFFSET_BIT = 1;
	const CULLING_BIT = 2;
	const DEPTH_TEST_BIT = 3;
	const WINDING_BIT = 4;

	/**
	 * This is a webGL state. It is passed The WebGL StateManager.
	 * Each mesh renderered may require webGL to be in a different state.
	 * For example you may want different blend mode or to enable polygon offsets
	 *
	 * @class
	 */
	export class GLState {
		data = 0;

		constructor() {
		}

		/**
		 * Activates blending of the computed fragment color values
		 *
		 * @member {boolean}
		 */
		get blend() {
			return !!(this.data & BLEND_BIT);
		}

		set blend(value) // eslint-disable-line require-jsdoc
		{
			if (!!(this.data & (1 << BLEND_BIT)) !== value) {
				this.data ^= (1 << BLEND_BIT);
			}
		}

		/**
		 * Activates adding an offset to depth values of polygon's fragments
		 *
		 * @member {boolean}
		 * @default false
		 */
		get offsets() {
			return !!(this.data & (1 << OFFSET_BIT));
		}

		set offsets(value) // eslint-disable-line require-jsdoc
		{
			if (!!(this.data & (1 << OFFSET_BIT)) !== value) {
				this.data ^= (1 << OFFSET_BIT);
			}
		}

		/**
		 * Activates culling of polygons.
		 *
		 * @member {boolean}
		 * @default false
		 */
		get culling() {
			return !!(this.data & (1 << CULLING_BIT));
		}

		set culling(value) // eslint-disable-line require-jsdoc
		{
			if (!!(this.data & (1 << CULLING_BIT)) !== value) {
				this.data ^= (1 << CULLING_BIT);
			}
		}

		/**
		 * Activates depth comparisons and updates to the depth buffer.
		 *
		 * @member {boolean}
		 * @default false
		 */
		get depthTest() {
			return !!(this.data & (1 << DEPTH_TEST_BIT));
		}

		set depthTest(value) // eslint-disable-line require-jsdoc
		{
			if (!!(this.data & (1 << DEPTH_TEST_BIT)) !== value) {
				this.data ^= (1 << DEPTH_TEST_BIT);
			}
		}

		/**
		 * Specifies whether or not front or back-facing polygons can be culled.
		 * @member {boolean}
		 * @default false
		 */
		get clockwiseFrontFace() {
			return !!(this.data & (1 << WINDING_BIT));
		}

		set clockwiseFrontFace(value) // eslint-disable-line require-jsdoc
		{
			if (!!(this.data & (1 << WINDING_BIT)) !== value) {
				this.data ^= (1 << WINDING_BIT);
			}
		}
	}
}
