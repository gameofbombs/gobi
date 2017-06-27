namespace gobi.core {
	export enum COMPONENT_BITS {
		//8 bits reserved by engine
		TRANSFORM = 1,
		ALPHATINT = 2,
		DISPLAY = 4,
		BIT_3 = 8,
		BIT_4 = 16,
		BIT_5 = 32,
		BIT_6 = 64,
		BIT_7 = 128,
		//everything else is for callbacks
	}

	export class NodeUpdateQueue {
		updateID: number = 0;
		uFlags: number;
		tempParentStack: Array<Node> = [];
		callbacks: Array<(context: NodeUpdateQueue, node: Node) => boolean> = [];
		queue: Array<Node> = [];
		queueUpdateID: number = 0;

		newUpdateError(str: string) {
			return new Error(str);
		}

		invalidateNode(node: Node) {
			this.queue.push(node);
		}

		flushUpdateFlags() {
			if (this.uFlags === 0) return;
			this.uFlags = 0;
			this.updateID++;
		}

		flushQueue() {
			let q = this.queue;
			this.queue = [];
			this.queueUpdateID++;
			for (let i = 0; i < q.length; i++) {
				let node = q[i];
				if (node.updater === this) {
					node.updateSearch();
				}
			}
		}
	}

	export interface IContainerBase<TNode> {
		// flash and pixi legacy
		readonly parent: TNode
		addChild(child: TNode): void
		addChildAt(child: TNode, index: number): void
		swapChildren(child1: TNode, child2: TNode): void
		swapChildrenAt(index1: number, index2: number): void
		getChildIndex(child: TNode): number
		setChildIndex(child: TNode, index: number): void
		getChildAt(index: number): TNode
		removeChild(child: TNode): TNode
		removeChildAt(index: number): TNode
		removeChildren(beginIndex?: number, endIndex?: number): Array<TNode>
		contains(child: TNode): boolean

		//this is new stuff - stage wont know that
		detachChild(child: TNode): TNode
		detachChildAt(index: number): TNode
		detachChildren(beginIndex?: number, endIndex?: number): Array<TNode>
	}

	export interface ILazyNodeBase {
		//TODO: bounds updates that go up, z-index updates that go up

		/**
		 * which components of node are being updated
		 */
		readonly uFlags: number;
		/**
		 * updates of certain components do not affect children
		 */
		readonly uFlagsStop: number;
		/**
		 * what updates has happened in parent
		 */
		readonly uFlagsParent: number;

		/**
		 * updates to be passed to children
		 */
		readonly uFlagsChildren: number;

		readonly lastCtxUpdateID: number;

		/**
		 * something was changed, help!
		 * @param mask
		 */
		invalidate(mask: number): void;
	}

	export interface ILazyNode<UpdaterType> extends ILazyNodeBase {
		/**
		 * stage exists in flash but does not exist in pixi
		 * fires update parents if necessary
		 */
		readonly updater: UpdaterType


		/**
		 * updates single node
		 *
		 * @param compMask
		 */
		update(compMask?: number): number;

		/**
		 * updates node and propagates flags to children
		 *
		 */
		updateWithChildren(compMask?: number): void;

		/**
		 * updates this node and dependent children
		 *
		 * @param compMask components to check in this node
		 * @param mode 0 - optimized, 1 - mark everything with CtxUpdateId, 2 - go into all children, 3 - ignore update mask
		 */
		updateRecursive(compMask?: number, mode?: number): void;

		/**
		 * goes up and update largest subtress by every bit of info
		 * uses stage globalUpdateId to track that node is fully updated
		 */
		updateSearch(): number

		/**
		 * propagates all updates from all parents
		 * does not look at parents beyond specific global update id
		 *
		 * @param compMask
		 * @param compMask targets as a binary mask
		 * @param maxCtxUpdateId 0 if not checked, some number that limits parent checks
		 */
		updateBubble(compMask?: number, maxCtxUpdateId?: number): void
	}

	export class NodeCollection {
		updateContext: NodeUpdateQueue = new NodeUpdateQueue();
		stageNode: Node;

		attachedSet: { [key: number]: Node } = [];
		detachedSet: { [key: number]: Node } = [];
		private tempQueueStack: Array<Array<Node>> = [];

		allocateQueue() {
			return this.tempQueueStack.pop() || [];
		}

		returnQueue(value: Array<Node>) {
			value.length = 0;
			this.tempQueueStack.push(value);
		}

		newStageError(str: string) {
			return new Error(str);
		}

		detachSubtree(subtree: Node): void {
			let q = this.tempQueueStack.pop() || [];
			let aSet = this.attachedSet;
			let dSet = this.detachedSet;
			q.length = 0;
			q.push(subtree);
			for (let i = 0; i < q.length; i++) {
				let x = q[i];
				if (x.parentCollection !== this) {
					//subtree not of this stage? someone removed it in signals
					continue;
				}
				dSet[x.uniqId] = x;
				delete aSet[x.uniqId];
				for (let j = 0; j < x.children.length; j++) {
					q.push(x.children[j]);
				}
			}
			q.length = 0;
			this.tempQueueStack.push(q);
		}

		addSubtree(subtree: Node): void {
			let q = this.tempQueueStack.pop() || [];
			let aSet = this.attachedSet;
			let dSet = this.detachedSet;
			q.length = 0;
			q.push(subtree);
			for (let i = 0; i < q.length; i++) {
				let x = q[i];

				if (x.parentCollection !== this) {
					x.parentCollection = this;
					x.updater = this.updateContext;
					x.lastCtxUpdateID = -1;
					//TODO: add to stage event
				} else {
					delete dSet[x.uniqId];
				}
				aSet[x.uniqId] = x;

				for (let j = 0; j < x.children.length; j++) {
					q.push(x.children[j]);
				}
			}
			q.length = 0;
			this.tempQueueStack.push(q);
		}

		removeSubtree(subtree: Node): void {
			let q = this.tempQueueStack.pop() || [];
			let aSet = this.attachedSet;
			let dSet = this.detachedSet;
			q.length = 0;
			q.push(subtree);
			for (let i = 0; i < q.length; i++) {
				let x = q[i];

				this.innerRemoveNode(x);
				delete aSet[x.uniqId];
				delete dSet[x.uniqId];

				for (let j = 0; j < x.children.length; j++) {
					q.push(x.children[j]);
				}
			}
			q.length = 0;
			this.tempQueueStack.push(q);
		}

		private innerRemoveNode(node: Node) {
			if (node.parentCollection !== this) {
				// already removed
				return;
			}
			//TODO: removed from stage event
			node.parentCollection = nullCollection;
			node.updater = nullCollection.updateContext;
		}

		flushDetached() {
			let q = this.detachedSet;
			let flag = false;
			for (let key in q) {
				flag = true;
				break;
			}
			if (!flag) return;

			this.detachedSet = {};
			let keys = Object.keys(q);
			for (let key in q) {
				this.innerRemoveNode(q[key]);
			}
		}
	}

	export interface IDisposable {
		destroyed: boolean;
		destroy(options?: any): void;
	}

	export interface IDisplayObject extends IDisposable, INodeRenderer {
		node: Node;
		visible: boolean;
		renderable: boolean;

		calculateBounds(bounds: Bounds): void;
	}

	export interface INodeRenderer {
		renderWebGL(renderer: gobi.pixi.WebGLRenderer, target: Node): void;
	}


}
