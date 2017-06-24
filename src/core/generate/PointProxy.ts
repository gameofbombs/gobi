namespace gobi.core.generate {
	export class PointProxy implements IPoint {
		callback: (pp: PointProxy) => boolean;
		inner: Point;
		_updateID: number = 0;
		_lastUpdateID: number = -1;

		constructor(cb: (pp: PointProxy) => boolean, inner?: Point) {
			this.callback = cb;
			this.inner = inner || new Point(0, 0);
		}

		set x(value: number) {
			const orig = this.inner;
			if (orig.x !== value) {
				orig.x = value;
				this.invalidate();
			}
		}

		set y(value: number) {
			const orig = this.inner;
			if (orig.y !== value) {
				orig.y = value;
				this.invalidate();
			}
		}

		clonePoint() {
			return new Point(this.inner.x, this.inner.y);
		}

		copyFrom(p: IPoint) {
			const orig = this.inner;
			if (orig.x !== p.x || orig.y !== p.y) {
				orig.x = p.x;
				orig.y = p.y;
				this.invalidate();
			}
		}

		invalidate() {
			const last = this._updateID++;
			if (last === this._lastUpdateID) {
				if (this.callback(this)) {
					this._lastUpdateID = this._updateID;
				}
			}
		}

		markUpdated() {
			this._lastUpdateID = this._updateID;
		}

		set(x: number, y: number) {
			const orig = this.inner;
			if (orig.x !== x || orig.y !== y) {
				orig.x = x;
				orig.y = y;
				this.invalidate();
			}
		}
	}
}
