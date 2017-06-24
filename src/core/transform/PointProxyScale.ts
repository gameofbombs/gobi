namespace gobi.core.transform {
	export class PointProxyScale implements IPoint {
		observer: Transform;
		inner: FlatTransform2d;

		constructor(transform: Transform, affine: FlatTransform2d) {
			this.observer = transform;
			this.inner = affine;
		}

		get x() {
			return this.inner.scaleX;
		}

		get y() {
			return this.inner.scaleY;
		}

		set x(value: number) {
			const orig = this.inner;
			if (orig.scaleX !== value) {
				orig.scaleX = value;
				this.observer.invalidate();
			}
		}

		set y(value: number) {
			const orig = this.inner;
			if (orig.scaleY !== value) {
				orig.scaleY  = value;
				this.observer.invalidate();
			}
		}

		clonePoint() {
			return new Point(this.inner.scaleX, this.inner.scaleY);
		}

		copyFrom(p: IPoint) {
			const orig = this.inner;
			if (orig.scaleX !== p.x || orig.scaleY !== p.y) {
				orig.scaleX = p.x;
				orig.scaleY = p.y;
				this.observer.invalidate();
			}
		}

		set(x: number, y: number) {
			if (y === undefined) {
				y = x;
			}
			const orig = this.inner;
			if (orig.scaleX !== x || orig.scaleY !== y) {
				orig.scaleX = x;
				orig.scaleY = y;
				this.observer.invalidate();
			}
		}
	}
}
