namespace gobi.core.transform {
	export class PointProxyShear implements IPoint {
		observer: Transform;
		inner: FlatTransform2d;

		constructor(transform: Transform, affine: FlatTransform2d) {
			this.observer = transform;
			this.inner = affine;
		}

		get x() {
			return this.inner.shearX;
		}

		get y() {
			return this.inner.shearY;
		}

		set x(value: number) {
			const orig = this.inner;
			if (orig.shearX !== value) {
				orig.shearX = value;
				this.observer.invalidate(true);
			}
		}

		set y(value: number) {
			const orig = this.inner;
			if (orig.shearY !== value) {
				orig.shearY  = value;
				this.observer.invalidate(true);
			}
		}

		clonePoint() {
			return new Point(this.inner.shearX, this.inner.shearY);
		}

		copyFrom(p: IPoint) {
			const orig = this.inner;
			if (orig.shearX !== p.x || orig.shearY !== p.y) {
				orig.shearX = p.x;
				orig.shearY = p.y;
				this.observer.invalidate(true);
			}
		}

		set(x: number, y: number) {
			if (y === undefined) {
				y = x;
			}
			const orig = this.inner;
			if (orig.shearX !== x || orig.shearY !== y) {
				orig.shearX = x;
				orig.shearY = y;
				this.observer.invalidate(true);
			}
		}
	}
}
