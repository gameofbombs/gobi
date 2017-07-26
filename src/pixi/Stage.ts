///ts:ref=Container
/// <reference path="./Container.ts"/> ///ts:ref:generated
namespace gobi.pixi {
	import IContainerBase = gobi.core.IContainerBase;
	import Node = gobi.core.Node;
	import Transform = gobi.core.Transform;
	import Matrix = gobi.core.Matrix;
	import Rectangle = gobi.core.Rectangle;
	import COMPONENT_BITS = gobi.core.COMPONENT_BITS;
	import nullStage = gobi.core.nullCollection;
	import NodeCollection = gobi.core.NodeCollection;

	export class Stage extends Container {
		constructor() {
			super();

			const collection = new NodeCollection();

			this.parentCollection = collection;
			collection.stageNode = this;
			this.updater = collection.updateContext;
			// this.uFlagsStop = -1;
		}

		autoUpdate = true;
		needUpdate = false;

		updateTransform() {
			this.updater.flushQueue();
			this.parentCollection.flushDetached();
			if (this.autoUpdate || this.needUpdate) {
				this.parentCollection.layers.updateDisplay(this);
				this.needUpdate = false;
			} else {
				if (this.parentCollection.layers.checkDirty()) {
					this.parentCollection.layers.updateDisplay(this);
					this.needUpdate = false;
				}
			}
		}
	}
}
