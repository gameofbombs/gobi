namespace gobi.pixi {
	import IPoint = gobi.core.IPoint;
	import Point = gobi.core.Point;

	export interface AnchoredDisplayObject {
		_onAnchorUpdate(): void;
	}

	export class PointProxyAnchor implements IPoint {
		observer: AnchoredDisplayObject;

		_x = 0;
		_y = 0;

		constructor(sprite: AnchoredDisplayObject) {
			this.observer = sprite;
		}

		get x() {
			return this._x;
		}

		get y() {
			return this._y;
		}

		set x(value: number) {
			if (this._x !== value) {
				this._x = value;
				this.observer._onAnchorUpdate();
			}
		}

		set y(value: number) {
			if (this._y !== value) {
				this._y = value;
				this.observer._onAnchorUpdate();
			}
		}

		clonePoint() {
			return new Point(this._x, this._y);
		}

		copyFrom(p: IPoint) {
			if (this._x !== p.x || this._y !== p.y) {
				this._x = p.x;
				this._y = p.y;
				this.observer._onAnchorUpdate();
			}
		}

		set(x: number, y: number) {
			if (y === undefined) {
				y = x;
			}
			if (this._x !== x || this._y !== y) {
				this._x = x;
				this._y = y;
				this.observer._onAnchorUpdate();
			}
		}
	}
}
