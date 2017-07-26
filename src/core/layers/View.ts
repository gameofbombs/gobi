namespace gobi.core {
	export class View {
		constructor(node: Node) {
			this.node = node;
		}

		node: Node = null;

		parentGroup: Group = null;

		/**
		 * Object will be rendered
		 *
		 * please specify it to handle zOrder and zIndex
		 *
		 * its always null for layers
		 *
		 */
		parentLayer: Layer = null;

		_activeParentLayer: Layer = null;

		/**
		 * zOrder is floating point number, distance between screen and object
		 * Objects with largest zOrder will appear first in their Layer, if zOrder sorting is enabled
		 */
		zOrder: number = 0;

		/**
		 * We dont use it yet
		 * @type {number}
		 */
		zIndex: number = 0;

		/**
		 * treeOrder is calculated by DisplayList, it is required for sorting inside DisplayGroup
		 */
		treeOrder: number = 0;

		/**
		 * displayOrder is calculated by render, it is required for interaction
		 *
		 * @type {number}
		 */
		displayOrder: number = 0;

		/**
		 *
		 */
		layerOrder: number = 0;
	}
}
