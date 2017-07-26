namespace gobi.core {

	export interface IPoint {
		x: number;
		y: number;
		set(x: number, y?: number): void;
		copyFrom(p: IPoint): void;
		clonePoint(): Point;
	}

	/**
	 * The Point object represents a location in a two-dimensional coordinate system, where x represents
	 * the horizontal axis and y represents the vertical axis.
	 *
	 * @class
	 * @memberof PIXI
	 */
	export class Point implements IPoint {
		x: number;
		y: number;

		constructor(_x?: number, _y?: number) {
			this.x = _x || 0;
			this.y = _y || 0;
		}

		clonePoint() {
			return new Point(this.x, this.y);
		}

		copyFrom(p: IPoint) {
			this.set(p.x, p.y);
		}

		equals(p: IPoint) {
			return (p.x === this.x) && (p.y === this.y);
		}

		set(_x: number, _y?: number) {
			this.x = _x || 0;
			this.y = _y || ((_y !== 0) ? this.x : 0);
		}

	}
}
