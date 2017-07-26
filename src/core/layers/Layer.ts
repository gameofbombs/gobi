namespace gobi.core {
	export class Layer {
		constructor(node: Node, group: Group = null) {
			this.group = group;
			this.node = node;
		}

		node: Node;

		_counterOrder = 0;

		group: Group = null;
		views: Array<View> = [];
		sortedViews: Array<View> = [];
		_tempLayerParent: Layer = null;

		onDisplay = new Signal<(layerNode: Node) => void>();

		beginWork(stage: LayerCollection) {
			const active = this.views;
			// this._activeStageParent = stage;
			this.group.foundLayer(stage, this);
			const groupChildren = this.group._activeChildren;
			if (this.group._lastLayerUpdateId)

			active.length = 0;
			for (let i = 0; i < groupChildren.length; i++) {
				groupChildren[i]._activeParentLayer = this;
				active.push(groupChildren[i]);
			}
			groupChildren.length = 0;
		}

		endWork() {
			const active = this.views;
			const sorted = this.sortedViews;

			// if ((this.listeners as any)('display', true)) {
			// 	for (let i = 0; i < active.length; i++) {
			// 		this.emit("display", active[i])
			// 	}
			// }

			sorted.length = 0;
			for (let i = 0; i < active.length; i++) {
				sorted.push(active[i]);
			}

			if (this.group.enableSort) {
				this.doSort();
			}
			this.onDisplay.emit(this.node);
		}

		updateDisplayLayers() {

		}

		/**
		 * you can override this method for this particular layer, if you want
		 */
		doSort() {
			this.group.doSort(this, this.sortedViews, this.views);
		}

		// updateDisplay() {
		// 	this._lastDisplayOrder = 0;
		//
		// 	// if the object is not visible or the alpha is 0 then no need to render this element
		// 	// if (this.worldAlpha <= 0 || !this.renderable) {
		// 	// 	return;
		// 	// }
		//
		// 	if (layer) {
		// 		this.view.layerOrder = layer.incDisplayOrder();
		// 	}
		// 	const views = this.sortedViews;
		// 	for (let i = 0; i < views.length; i++) {
		// 		views[i].element.updateDisplay(this);
		// 	}
		//
		// 	const children = this.children;
		// 	for (let i = 0; i < children.length; i++) {
		// 		children[i].updateDisplay(null);
		// 	}
		// }
		//
		// _preRender(renderer: WebGLRenderer): boolean {
		// 	if (this.view._activeParentLayer && this.view._activeParentLayer != renderer._activeLayer) {
		// 		return false;
		// 	}
		//
		// 	if (renderer.depthMode === DEPTH_MODE.FRONT_TO_BACK) {
		// 		//the simplest solution
		// 		if (this._mask || this._filters) {
		// 			return false;
		// 		}
		// 	}
		//
		// 	// if the object is not visible or the alpha is 0 then no need to render this element
		// 	if (this.worldAlpha <= 0 || !this.renderable) {
		// 		return false;
		// 	}
		//
		// 	//just a temporary feature - getBounds() for filters will work with that
		// 	//TODO: make a better hack for getBounds()
		//
		// 	this._boundsID++;
		//
		// 	this._tempLayerParent = renderer._activeLayer;
		// 	renderer._activeLayer = this;
		// 	return true;
		// }
		//
		// _postRender(renderer: WebGLRenderer) {
		// 	renderer._activeLayer = this._tempLayerParent;
		// 	this._tempLayerParent = null;
		// }
		//
		// renderWebGL(renderer: WebGLRenderer) {
		// 	super.renderWebGL(renderer);
		// 	if (this._preRender(renderer)) {
		// 		//TODO: filters for this children too!!!
		// 		const views = this.sortedViews;
		// 		if (renderer.depthMode === DEPTH_MODE.FRONT_TO_BACK) {
		// 			for (let i = views.length - 1; i >= 0; i--) {
		// 				views[i].element.renderWebGL(renderer);
		// 			}
		// 		} else {
		// 			for (let i = 0; i < views.length; i++) {
		// 				views[i].element.renderWebGL(renderer);
		// 			}
		// 		}
		// 		this._postRender(renderer);
		// 	}
		// }
	}
}
