///ts:ref=DisplayObject
/// <reference path="./DisplayObject.ts"/> ///ts:ref:generated
///ts:ref=Node
/// <reference path="../core/display/Node.ts"/> ///ts:ref:generated

namespace gobi.pixi {
	import Node = gobi.core.Node;
	import IContainerBase = gobi.core.IContainerBase;
	import COMPONENT_BITS = gobi.core.COMPONENT_BITS;
	import Matrix = gobi.core.Matrix;
	import IPoint = gobi.core.IPoint;
	import Rectangle = gobi.core.Rectangle;
	import nullCollection = gobi.core.nullCollection;
	import NodeBase = gobi.core.NodeBase;

	export class Container extends NodeBase<Container> {
		get stage() {
			if (this.parentCollection === nullCollection) {
				return null;
			}
			return this.parentCollection.stageNode as Stage;
		}

		//=== TINT PROPS ===

		get alpha(): number {
			return this.tintRgba[3];
		}

		set alpha(value: number) {
			this.tintRgba[3] = value;
			this.invalidate(COMPONENT_BITS.ALPHATINT);
		}

		//=== TRANSFORM PROPS ===

		get worldTransform(): Matrix {
			return this.transform.worldTransform;
		}

		get position(): IPoint {
			return this.transform.position;
		}

		set position(value: IPoint) {
			this.transform.position.copyFrom(value);
		}

		get scale(): IPoint {
			return this.transform.scale;
		}

		set scale(value: IPoint) {
			this.transform.scale.copyFrom(value);
		}

		get pivot(): IPoint {
			return this.transform.pivot;
		}

		set pivot(value: IPoint) {
			this.transform.pivot.copyFrom(value);
		}

		get skew(): IPoint {
			return this.transform.skew;
		}

		set skew(value: IPoint) {
			this.transform.skew.copyFrom(value);
		}

		get rotation(): number {
			return this.transform.rotation * gobi.core.DEG_TO_RAD;
		}

		set rotation(value: number) {
			this.transform.rotation = value * gobi.core.RAD_TO_DEG;
		}

		get x(): number {
			return this.transform.flat.posX;
		}

		set x(value: number) {
			this.transform.position.x = value;
		}

		get y(): number {
			return this.transform.flat.posY;
		}

		set y(value: number) {
			this.transform.position.y = value;
		}

		//TODO: implement these props

		destroyed: boolean = false;

		visible: boolean = true;

		renderable: boolean = true;

		filters: Array<Object> = null;

		mask: Container = null;

		worldVisible: boolean = null;

		getBounds(): Rectangle {
			this.updateBubble(COMPONENT_BITS.TRANSFORM);
			this.updateRecursive(COMPONENT_BITS.TRANSFORM, 2);

			return this.visualBounds.getBounds();
		}

		getLocalBounds(): Rectangle {
			this.updateBubble(COMPONENT_BITS.TRANSFORM);
			this.updateRecursive(COMPONENT_BITS.TRANSFORM, 2);

			return this.visualBounds.getLocalBounds();
		}

		_width = 0;
		_height = 0;

		get width(): number {
			return this.scale.x * this.getLocalBounds().width;
		}

		get height(): number {
			return this.scale.y * this.getLocalBounds().height;
		}

		set width(value: number) {
			const cur = this.getLocalBounds().width;

			if (cur !== 0) {
				this.scale.x = value / cur;
			}
			else {
				this.scale.x = 1;
			}

			this._width = value;
		}

		set height(value: number) {
			const cur = this.getLocalBounds().height;
			if (cur !== 0) {
				this.scale.y = value / cur;
			}
			else {
				this.scale.y = 1;
			}

			this._height = value;
		}

		/**
		 * legacy, updates all components ignoring their update flag state
		 */
		updateTransform() {
			this.updateRecursive(3);
		}

		addChild(...child: Array<Container>) {
			// if (child instanceof Array) {
			for (let i = 0; i < child.length; ++i) {
				super.addChild(child[i]);
			}
			// } else if (arguments.length > 1) {
			//
			// } else {
			// 	super.addChild(child);
			// }
		}

		//TODO: toLocal, toGlobal

		toGlobal(position: IPoint, point: IPoint, skipUpdate?: boolean) {
			if (!skipUpdate) {
				this.updateBubble(COMPONENT_BITS.TRANSFORM);
			}

			// don't need to update the lot
			return this.worldTransform.apply(position, point);
		}

		/**
		 * Calculates the local position of the display object relative to another point
		 *
		 * @param {PIXI.Point} position - The world origin to calculate from
		 * @param {PIXI.DisplayObject} [from] - The DisplayObject to calculate the global position from
		 * @param {PIXI.Point} [point] - A Point object in which to store the value, optional
		 *  (otherwise will create a new Point)
		 * @param {boolean} [skipUpdate=false] - Should we skip the update transform
		 * @return {PIXI.Point} A point object representing the position of this object
		 */
		toLocal(position: IPoint, from: Container, point: IPoint, skipUpdate?: boolean) {
			if (from) {
				position = from.toGlobal(position, point, skipUpdate);
			}

			if (!skipUpdate) {
				this.updateBubble(COMPONENT_BITS.TRANSFORM);
			}

			// simply apply the matrix..
			return this.worldTransform.applyInverse(position, point);
		}

		//==== EVENT EMITTER ====

		on(type: interaction.EventTypes, cb: (event: interaction.Event) => void) {
			this.events.on(type, cb);
			return this;
		}

		off(type: interaction.EventTypes, cb: (event: interaction.Event) => void) {
			this.events.off(type, cb);
			return this;
		}

		once(type: interaction.EventTypes, cb: (event: interaction.Event) => void) {
			this.events.once(type, cb);
			return this;
		}

		emit(type: interaction.EventTypes, ev: interaction.Event) {
			this.events.emit(type, ev);
			return this;
		}
	}
}
