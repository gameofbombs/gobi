namespace gobi.core {
	export class Group {
		computedChildren: Array<View>;

		_activeLayer: Layer = null;

		_activeStage: LayerCollection = null;

		_activeChildren: Array<View> = [];

		_lastLayerUpdateId = -1;

		_viewUpdateId = -1;
		_lastViewUpdateId = -1;

		//TODO: handle orphan groups
		//TODO: handle groups that don't want to be drawn in parent
		canDrawWithoutLayer = false;
		canDrawInParentStage = true;

		onSort: (e: View) => void = null;

		/**
		 * default zIndex value for layers that are created with this Group
		 * @type {number}
		 */
		zIndex = 0;

		enableSort = false;

		constructor(zIndex: number, sorting: ((e: View) => void) | boolean) {
			this.zIndex = zIndex;

			this.enableSort = !!sorting;

			if (typeof sorting === 'function') {
				this.onSort = sorting as any;
			}
		}

		_tempResult: Array<View> = [];
		_tempZero: Array<View> = [];

		doSort(layer: Layer, sorted: Array<View>, input: Array<View>) {
			if (this.onSort) {
				for (let i = 0; i < sorted.length; i++) {
					this.onSort(sorted[i]);
				}
			}
			sorted.sort(Group.compareZIndex);
		}

		static compareZIndex(a: View, b: View) {
			if (a.zIndex > b.zIndex) {
				return 1;
			}
			if (a.zIndex < b.zIndex) {
				return -1;
			}
			if (a.zOrder > b.zOrder) {
				return -1;
			}
			if (a.zOrder < b.zOrder) {
				return 1;
			}
			if (a.treeOrder < b.treeOrder) {
				return -1;
			}
			if (a.treeOrder > b.treeOrder) {
				return 1;
			}
			return 0;
		}

		private _tempZIndex: Array<number> = [];

		/**
		 * clears temporary variables
		 */
		clear() {
			this._activeLayer = null;
			this._activeStage = null;
			this._activeChildren.length = 0;
		}

		/**
		 * used only by displayList before sorting takes place
		 */
		addDisplayObject(stage: LayerCollection, view: View) {
			this.check(stage);
			view._activeParentLayer = this._activeLayer;
			if (this._activeLayer) {
				this._activeLayer.views.push(view);
			} else {
				this._activeChildren.push(view);
			}
		}

		/**
		 * called when corresponding layer is found in current stage
		 * @param stage
		 * @param layer
		 */
		foundLayer(stage: LayerCollection, layer: Layer) {
			this.check(stage);
			if (this._activeLayer != null) {
				Group.conflict();
			}
			this._activeLayer = layer;
			this._activeStage = stage;
		}

		/**
		 * called after stage finished the work
		 * @param stage
		 */
		foundStage(stage: LayerCollection) {
			if (!this._activeLayer && !this.canDrawInParentStage) {
				this.clear();
			}
		}

		check(stage: LayerCollection) {
			this._lastViewUpdateId = this._viewUpdateId;

			if (this._lastLayerUpdateId < LayerCollection._counterDisplayUpdate) {
				this._lastLayerUpdateId = LayerCollection._counterDisplayUpdate;
				this.clear();
				this._activeStage = stage;
			} else if (this.canDrawInParentStage) {
				if (stage !== this._activeStage) {
					//WTF??
					this._activeStage = null;
					this.clear();
					return;
				}

				//TODO: multiStage
				// let current = this._activeStage;
				// while (current && current != stage) {
				// 	current = current._activeParentStage;
				// }
				// this._activeStage = current;
				// if (current == null) {
				// 	this.clear();
				// 	return
				// }
			}
		}

		invalidateView() {
			this._viewUpdateId++;
		}

		/**
		 * if layer wont be found, this thing will always return true
		 * @returns {boolean}
		 */
		isDirtyView() {
			return this._lastViewUpdateId !== this._viewUpdateId;
		}

		static _lastLayerConflict = 0;

		static conflict() {
			if (Group._lastLayerConflict + 5000 < Date.now()) {
				Group._lastLayerConflict = Date.now();
				// log("PIXI-display plugin found two layers with the same group in one stage - that's not healthy. Please place a breakpoint here and debug it");
			}
		}
	}
}