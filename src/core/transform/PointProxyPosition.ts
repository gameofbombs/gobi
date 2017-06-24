namespace gobi.core.transform {
	export class PointProxyPosition implements IPoint {
		observer: Transform;
		inner: FlatTransform2d;

		constructor(transform: Transform, flat: FlatTransform2d) {
			this.observer = transform;
			this.inner = flat;
		}

		get x() {
			return this.inner.posX;
		}

		get y() {
			return this.inner.posY;
		}

		set x(value: number) {
			const orig = this.inner;
			if (orig.posX !== value) {
				orig.posX = value;
				this.observer.invalidate();
			}
		}

		set y(value: number) {
			const orig = this.inner;
			if (orig.posY !== value) {
				orig.posY  = value;
				this.observer.invalidate();
			}
		}

		clonePoint() {
			return new Point(this.inner.posX, this.inner.posY);
		}

		copyFrom(p: IPoint) {
			const orig = this.inner;
			if (orig.posX !== p.x || orig.posY !== p.y) {
				orig.posX = p.x;
				orig.posY = p.y;
				this.observer.invalidate();
			}
		}

		set(x: number, y: number) {
			const orig = this.inner;
			if (orig.posX !== x || orig.posY !== y) {
				orig.posX = x;
				orig.posY = y;
				this.observer.invalidate();
			}
		}
	}
}
