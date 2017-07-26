namespace gobi.core {
	const fourOnes = [1, 1, 1, 1];

	export class NodeBase<TNode extends NodeBase<any>> implements IContainerBase<TNode>, ILazyNode<NodeUpdateQueue>, IDisposable {
		uniqId: number = UniqIdGenerator.getUniq();
		transform = new Transform(this);
		displayObject: IDisplayObject = null;
		renderBehaviour: INodeRenderer = gobi.pixi.defaultNodeRenderer;

		parent: TNode = null;
		parentCollection: NodeCollection = nullCollection;
		children: Array<TNode> = [];
		//TODO: move it to renderSession
		tintRgba = new Float32Array(fourOnes);
		worldTintRgba = new Float32Array(fourOnes);

		visualBounds: NodeBounds = new NodeBounds(this);
		view: View = new View(this);
		layer: Layer = null;

		onAdded = new Signal<(elem: Node, collection: NodeCollection) => void>();
		onRemoved = new Signal<(elem: Node, collection: NodeCollection) => void>();

		// onChildrenChange = new Signal<(index: number) => void>();

		constructor(displayObject: IDisplayObject = null) {
			this.displayObject = displayObject;
		}

		private _addChildInner(child: TNode) {
			if (child.parent !== null) {
				child.parent.removeChild(child);
			}
			if (child.parentCollection !== this.parentCollection) {
				child.parentCollection.removeSubtree(child);
			}
			child.parent = this;
			child.uFlagsParent = -1;
			this.updater.invalidateNode(child);
			this.parentCollection.addSubtree(child);
		}

		//TODO: use onChildrenChange signal
		//TODO: more than one argument?

		addChild(child: TNode) {
			this._addChildInner(child);
			this.children.push(child);
			// this.onChildrenChange(this.children.length - 1);
			// child.emit('added', this);
		}

		addChildAt(child: TNode, index: number): void {
			this._addChildInner(child);
			this.children.splice(index, 0, child);
			//this.onChildrenChange(index);
			// child.emit('added', this);
		}

		swapChildren(child1: TNode, child2: TNode): void {
			const index1 = this.getChildIndex(child1);
			const index2 = this.getChildIndex(child2);
			this.children[index1] = child2;
			this.children[index2] = child1;
			``
		}

		swapChildrenAt(index1: number, index2: number): void {
			const child1 = this.children[index1];
			this.children[index1] = this.children[index2];
			this.children[index2] = child1;
		}

		getChildIndex(child: TNode): number {
			const index = this.children.indexOf(child);

			if (index === -1) {
				throw this.parentCollection.newStageError('The supplied Node must be a child of the caller');
			}

			return index;
		}

		setChildIndex(child: TNode, index: number): void {
			if (index < 0 || index >= this.children.length) {
				throw this.parentCollection.newStageError('The supplied index is out of bounds');
			}

			const currentIndex = this.getChildIndex(child);
			utils.removeItems(this.children, currentIndex, 1); // remove from old position
			this.children.splice(index, 0, child); // add at new position

			//this.onChildrenChange(index);
		}

		getChildAt(index: number): TNode {
			if (index < 0 || index >= this.children.length) {
				throw this.parentCollection.newStageError(`getChildAt: Index (${index}) does not exist.`);
			}

			return this.children[index];
		}

		_innerRemoveChild(child: TNode) {
			// ensure child transform will be recalculated..
			child.parent = null;
			child.uFlagsParent = -1;
			// ensure bounds will be recalculated
			// this._boundsID++;

			// TODO - lets either do all callbacks or all events.. not both!
			// this.onChildrenChange(index);
			// child.emit('removed', this);

			this.parentCollection.removeSubtree(child);
		}

		_innerDetachChild(child: TNode) {
			// ensure child transform will be recalculated..
			child.parent = null;
			child.uFlagsParent = -1;
			// ensure bounds will be recalculated
			// this._boundsID++;

			// TODO - lets either do all callbacks or all events.. not both!
			// this.onChildrenChange(index);
			// child.emit('removed', this);

			this.parentCollection.detachSubtree(child);
		}

		removeChild(child: TNode): TNode {
			const index = this.children.indexOf(child);

			if (index === -1) return null;
			utils.removeItems(this.children, index, 1);
			this._innerRemoveChild(child);

			return child;
		}

		removeChildAt(index: number): TNode {
			const child = this.getChildAt(index);

			utils.removeItems(this.children, index, 1);
			this._innerRemoveChild(child);

			return child;
		}

		removeChildren(beginIndex?: number, endIndex?: number): Array<TNode> {
			const begin = beginIndex;
			const end = typeof endIndex === 'number' ? endIndex : this.children.length;
			const range = end - begin;
			let removed;

			if (range > 0 && range <= end) {
				removed = this.children.splice(begin, range);

				for (let i = 0; i < removed.length; ++i) {
					this._innerRemoveChild(removed[i]);
				}

				return removed;
			}
			else if (range === 0 && this.children.length === 0) {
				return [];
			}

			//Range Error
			throw this.parentCollection.newStageError('removeChildren: numeric values are outside the acceptable range.');
		}

		detachChild(child: TNode): TNode {
			const index = this.children.indexOf(child);

			if (index === -1) return null;
			utils.removeItems(this.children, index, 1);
			this._innerDetachChild(child);

			return child;
		}

		detachChildAt(index: number): TNode {
			const child = this.getChildAt(index);

			utils.removeItems(this.children, index, 1);
			this._innerDetachChild(child);

			return child;
		}

		detachChildren(beginIndex?: number, endIndex?: number): Array<TNode> {
			const begin = beginIndex;
			const end = typeof endIndex === 'number' ? endIndex : this.children.length;
			const range = end - begin;
			let removed;

			if (range > 0 && range <= end) {
				removed = this.children.splice(begin, range);

				for (let i = 0; i < removed.length; ++i) {
					this._innerDetachChild(removed[i]);
				}

				return removed;
			}
			else if (range === 0 && this.children.length === 0) {
				return [];
			}

			//Range Error
			throw this.parentCollection.newStageError('removeChildren: numeric values are outside the acceptable range.');
		}

		contains(child: TNode): boolean {
			//TODO: implement it for flash! use queue of course
			return false;
		}

		//=== HERE BE UPDATE DRAGONS! ===

		uFlags: number = 0;
		uFlagsStop: number = 0;
		uFlagsParent: number = 0;
		uFlagsChildren: number = 0;
		uFlagsPushed: number = 0;
		lastCtxUpdateID: number = 0;
		updater: NodeUpdateQueue = this.parentCollection.updateContext;

		invalidate(mask: number) {
			const inv = (this.uFlags | this.uFlagsPushed) === 0;
			this.uFlags |= mask;
			this.updater.uFlags |= mask;
			if (inv) {
				this.updater.invalidateNode(this);
			}
		}

		updateNode(compMask: number): number {
			compMask &= this.uFlags | this.uFlagsParent;

			if (compMask == 0) {
				return 0;
			}

			const parent = this.parent;
			const parentStop = parent ? parent.uFlagsStop : -1;

			let resMask = compMask;

			// starting transform
			if ((compMask & COMPONENT_BITS.TRANSFORM) !== 0) {
				const parentTransform = (parentStop & COMPONENT_BITS.TRANSFORM) === 0 ? parent.transform : Transform.IDENTITY;
				this.transform.updateTransform(parentTransform);
			}

			// tint
			if ((compMask & COMPONENT_BITS.ALPHATINT) !== 0) {
				//updates tinting component, it actually belongs more to material
				const lt = this.tintRgba;
				const wt = this.worldTintRgba;
				if ((parentStop & COMPONENT_BITS.ALPHATINT) === 0) {
					const pt = parent.worldTintRgba;
					wt[0] = pt[0] * lt[0];
					wt[1] = pt[1] * lt[1];
					wt[2] = pt[2] * lt[2];
					wt[3] = pt[3] * lt[3];
				} else {
					wt[0] = lt[0];
					wt[1] = lt[1];
					wt[2] = lt[2];
					wt[3] = lt[3];
				}
			}

			if ((compMask & COMPONENT_BITS.CULL) !== 0) {
				//updates tinting component, it actually belongs more to material
				if ((parentStop & COMPONENT_BITS.CULL) === 0) {
					this.worldCullFlags = parent.worldCullFlags | this.cullFlags;
				} else {
					this.worldCullFlags = this.cullFlags;
				}
			}

			this.uFlags &= ~compMask;
			this.uFlagsParent &= ~compMask;
			this.uFlagsChildren |= resMask & ~this.uFlagsStop;

			return resMask;
		}

		updateWithChildren(compMask: number = -1): void {
			this.updateNode(compMask);

			const children = this.children;
			const len = children.length;
			const passMask = this.uFlagsChildren & ~this.uFlags;

			this.uFlagsPushed |= passMask;

			if (passMask !== 0) {
				this.uFlagsChildren &= ~passMask;
				for (let i = len - 1; i >= 0; i--) {
					children[i].uFlagsParent |= passMask;
				}
			}
		}

		updateRecursive(compMask: number = -1, mode: number = 0): void {
			if (mode == 3) {
				this.uFlagsParent |= compMask;
			}
			this.updateNode(compMask);

			const children = this.children;
			const len = children.length;
			let passMask = this.uFlagsChildren & ~this.uFlags;

			if (mode == 1) {
				this.lastCtxUpdateID = this.updater.updateID;
				passMask |= this.uFlagsPushed;
				this.uFlagsPushed = 0;
			}

			if (passMask !== 0 || mode > 1) {
				this.uFlagsChildren &= ~passMask;
				for (let i = len - 1; i >= 0; --i) {
					children[i].uFlagsParent |= passMask;
					children[i].updateRecursive(compMask, mode);
				}
			}
		}

		updateSearch(): number {
			const updater = this.updater;
			updater.flushUpdateFlags();
			const ctxUpdateId = updater.updateID;

			if ((this.worldCullFlags & CULL_BITS.VISIBLE) !== 0) {
				return ctxUpdateId;
			}

			let node: Node = this;
			let stack = updater.tempParentStack;
			stack.length = 0;
			while (node !== null && node.lastCtxUpdateID < ctxUpdateId) {
				stack.push(node);
				node = node.parent;
			}

			for (let i = stack.length - 1; i >= 0; --i) {
				stack[i].updateRecursive(-1, 1);
			}

			return ctxUpdateId;
		}

		updateBubble(compMask: number = -1, maxCtxUpdateId: number = 0): void {
			const updater = this.updater;
			let node: Node = this;
			let stack = updater.tempParentStack;
			stack.length = 0;
			while (node !== null &&
			(maxCtxUpdateId <= 0 || node.lastCtxUpdateID < maxCtxUpdateId)) {
				stack.push(node);
				node = node.parent;
			}

			for (let i = stack.length - 1; i >= 0; --i) {
				stack[i].updateWithChildren(compMask);
			}
		}

		destroyed: boolean = false;

		destroyThisNode(options: any) {
			this.destroyed = true;
			const obj = this.displayObject;
			if (obj && !obj.destroyed) {
				obj.destroy(options);
			}
			this.transform = null;
			this.tintRgba = null;
		}

		/**
		 * destroy using bfs
		 *
		 * @param options options like in pixijs
		 */
		destroy(options?: any) {
			this.parentCollection.removeSubtree(this);
			const queue = this.removeChildren(0, this.children.length);

			this.destroyThisNode(options);
			if (options.children) {
				for (let j = 0; j < queue.length; ++j) {
					const aVertex = queue[j];
					const q2 = aVertex.removeChildren(0, aVertex.children.length);
					aVertex.destroyThisNode(options);
					const children = aVertex.children;
					for (let i = q2.length - 1; i >= 0; --i) {
						queue.push(q2[j]);
					}
				}
			}
		}

		//==== CULLING COMPONENT ====
		cullFlags: number = 0;
		worldCullFlags: number = 0;

		get visible() {
			// also, turns off updates
			return (this.cullFlags & CULL_BITS.VISIBLE) === 0;
		}

		set visible(value: boolean) {
			let cur = (this.cullFlags & CULL_BITS.VISIBLE) === 0;
			if (cur !== value) {
				this.cullFlags ^= CULL_BITS.VISIBLE;
				if (value) {
					// turns on updates back
					this.updater.invalidateNode(this);
				}
			}
		}

		get renderable() {
			return (this.cullFlags & CULL_BITS.RENDERABLE) === 0;
		}

		set renderable(value: boolean) {
			let cur = (this.cullFlags & CULL_BITS.RENDERABLE) === 0;
			if (cur !== value) {
				this.cullFlags ^= CULL_BITS.RENDERABLE;
				this.invalidate(COMPONENT_BITS.CULL);
			}
		}

		//==== INTERACTION COMPONENT ====
		//TODO: how to do mixin in TS properly to merge classes?
		//TODO: optional component? two less objects

		events = new interaction.Events();
		hitArea: core.IShape = null;
		_mask: Node = null;
		interactiveChildren = true;
		interactive = true;
		trackedPointers: { [key: string]: interaction.TrackingData } = {};
		cursor: string = null;
	}

	export class Node extends NodeBase<Node> {
	}
}
