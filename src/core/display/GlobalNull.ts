///ts:ref=NodeInterfaces
/// <reference path="./NodeInterfaces.ts"/> ///ts:ref:generated

namespace gobi.core {
	export class NullUpdateQueue extends NodeUpdateQueue {
		invalidateNode(node: Node) {
			node.updateWithChildren(-1);
		}
	}

	export class NullNodeCollection extends NodeCollection {
		constructor() {
			super();
			this.updateContext = new NullUpdateQueue();
		}

		detachSubtree(subtree: Node): void {
		}

		addSubtree(subtree: Node): void {
		}

		removeSubtree(subtree: Node): void {
		}

		flushDetached() {
		}
	}

	export const nullCollection = new NullNodeCollection();

	//TODO: do we need nullNode?
}
