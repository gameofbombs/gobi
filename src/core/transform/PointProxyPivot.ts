namespace gobi.core.transform {
	export class PointProxyPivot implements IPoint {
		observer: Transform;
		inner: FlatTransform2d;

		constructor(transform: Transform, flat: FlatTransform2d) {
			this.observer = transform;
			this.inner = flat;
		}

		get x() {
			return this.inner.pivotX;
		}

		get y() {
			return this.inner.pivotY;
		}

		set x(value: number) {
			const orig = this.inner;
			if (orig.pivotX !== value) {
				orig.pivotX = value;
				this.observer.invalidate();
			}
		}

		set y(value: number) {
			const orig = this.inner;
			if (orig.pivotY !== value) {
				orig.pivotY  = value;
				this.observer.invalidate();
			}
		}

		clonePoint() {
			return new Point(this.inner.pivotX, this.inner.pivotY);
		}

		copyFrom(p: IPoint) {
			const orig = this.inner;
			if (orig.pivotX !== p.x || orig.pivotY !== p.y) {
				orig.pivotX = p.x;
				orig.pivotY = p.y;
				this.observer.invalidate();
			}
		}

		set(x: number, y: number) {
			const orig = this.inner;
			if (orig.pivotX !== x || orig.pivotY !== y) {
				orig.pivotX = x;
				orig.pivotY = y;
				this.observer.invalidate();
			}
		}
	}
}
