namespace gobi.core.transform {
	export class PointProxySkew implements IPoint {
		observer: Transform;
		inner: FlatTransform2d;

		constructor(transform: Transform, affine: FlatTransform2d) {
			this.observer = transform;
			this.inner = affine;
		}

		get x() {
			return -this.inner.shearY;
		}

		get y() {
			return this.inner.shearX;
		}

		set x(value: number) {
			value = -value;
			const orig = this.inner;
			if (orig.shearY !== value) {
				orig.shearY = value;
				this.observer.invalidate(true);
			}
		}

		set y(value: number) {
			const orig = this.inner;
			if (orig.shearX !== value) {
				orig.shearX = value;
				this.observer.invalidate(true);
			}
		}

		clonePoint() {
			return new Point(-this.inner.shearY, this.inner.shearX);
		}

		copyFrom(p: IPoint) {
			const orig = this.inner;
			const u = p.y, v = -p.x;
			if (orig.shearX !== u || orig.shearY !== v) {
				orig.shearX = u;
				orig.shearY = v;
				this.observer.invalidate(true);
			}
		}

		set(x: number, y: number) {
			if (y === undefined) {
				y = x;
			}
			const orig = this.inner;
			const u = y, v = -x;
			if (orig.shearX !== u || orig.shearY !== v) {
				orig.shearX = u;
				orig.shearY = v;
				this.observer.invalidate(true);
			}
		}
	}
}
