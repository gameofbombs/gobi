namespace gobi.core {
	export class LayerCollection {
		nodes: NodeCollection;

		constructor(nodeCollection: NodeCollection) {
			this.nodes = nodeCollection;
		}

		onBeforeDisplay = new Signal<(node: Node) => void>();
		onDisplay = new Signal<(node: Node) => void>();

		list: Array<Layer> = [];

		add(layer: Layer) {
			this.list.push(layer);
		}

		remove(layer: Layer): boolean {
			let k = this.list.indexOf(layer);
			if (k >= 0) {
				this.list.splice(k, 1);
				return true;
			}
			return false;
		}

		_counterTreeOrder = 0;
		_counterDisplayOrder = 0;
		static _counterDisplayUpdate = 0;

		_visitTree = (node: Node) => {
			//actually, its true for all views inside the node, if it has multiple
			node.view.treeOrder = ++this._counterTreeOrder;
			let ch = node.children;

			let view = node.view;
			if (view.parentGroup) {
				view.parentGroup.addDisplayObject(this, view);
			} else if (view.parentLayer) {
				view.parentLayer.group.addDisplayObject(this, view);
			}
			for (let i = 0; i < ch.length; i++) {
				this._visitTree(ch[i]);
			}
		};

		//this one works per views
		_visitView = (view: View, layer: Layer) => {
			view.displayOrder = ++this._counterDisplayOrder;
			let layer2 = view.node.layer;
			if (layer2) {
				let views = layer2.sortedViews;
				layer2._counterOrder = 0;
				for (let i = 0; i < views.length; i++) {
					views[i].layerOrder = ++layer2._counterOrder;
					this._visitView(views[i], layer2);
				}
			}

			let ch = view.node.children;
			for (let i = 0; i < ch.length; i++) {
				let v = ch[i].view;
				if (v._activeParentLayer === null) {
					this._visitView(v, layer);
				}
			}
		};

		updateDisplay(node: Node) {
			this.onBeforeDisplay.emit(node);

			let upd = ++LayerCollection._counterDisplayUpdate;

			this._counterDisplayOrder = 0;
			this._counterTreeOrder = 0;

			for (let i = 0; i < this.list.length; i++) {
				this.list[i].beginWork(this);
			}

			this._visitTree(node);

			for (let i = 0; i < this.list.length; i++) {
				this.list[i].endWork();
			}

			this._visitView(node.view, null);

			this.onDisplay.emit(node);
		}

		checkDirty() {
			let res = false;
			for (let i = 0; i < this.list.length; i++) {
				//TODO: remember versions here, what if there are two stages online?
				res = (this.list[i].group.isDirtyView() || res);
			}
			return res;
		}
	}
}
