namespace gobi.core {
	export class FlatTransform2d {
		posX: number = 0.0;
		posY: number = 0.0;
		scaleX: number = 1.0;
		scaleY: number = 1.0;
		pivotX: number = 0.0;
		pivotY: number = 0.0;
		rotZ: number = 0.0;
		shearX: number = 0.0;
		shearY: number = 0.0;

		_cx = 1; // cos rotation + skewY;
		_sx = 0; // sin rotation + skewY;
		_cy = 0; // cos rotation + Math.PI/2 - skewX;
		_sy = 1; // sin rotation + Math.PI/2 - skewX;

		matrix = new Matrix();

		constructor() {
		}

		set(posX: number, posY: number, pivotX: number, pivotY: number,
		    scaleX: number, scaleY: number, rotation: number, shearX: number, shearY: number) {
			this.posX = posX;
			this.posY = posY;
			this.pivotX = pivotX;
			this.pivotY = pivotY;
			this.scaleX = scaleX;
			this.scaleY = scaleY;
			this.rotZ = rotation;
			this.shearX = shearX;
			this.shearY = shearY;
		}

		updateRotation() {
			this._cx = Math.cos((this.rotZ + this.shearX) * DEG_TO_RAD);
			this._sx = Math.sin((this.rotZ + this.shearX) * DEG_TO_RAD);
			this._cy = -Math.sin((this.rotZ + this.shearY) * DEG_TO_RAD); // cos, added PI/2
			this._sy = Math.cos((this.rotZ + this.shearY) * DEG_TO_RAD); // sin, added PI/2
		}

		update(updateRotation?: boolean) {
			if (updateRotation !== false) {
				this.updateRotation();
			}

			const lt = this.matrix;

			//TODO: introduce "camera mode" , construct inverted transform here

			lt.a = this._cx * this.scaleX;
			lt.b = this._sx * this.scaleX;
			lt.c = this._cy * this.scaleY;
			lt.d = this._sy * this.scaleY;

			lt.tx = this.posX - ((this.pivotX * lt.a) + (this.pivotY * lt.c));
			lt.ty = this.posY - ((this.pivotX * lt.b) + (this.pivotY * lt.d));
		}

		decompose(matrix?: Matrix) {
			matrix = matrix || this.matrix;

			const a = matrix.a;
			const b = matrix.b;
			const c = matrix.c;
			const d = matrix.d;

			const shearY = Math.atan2(-c, d);
			const shearX = Math.atan2(b, a);

			const delta = Math.abs(1 - (shearX / shearY));

			if (delta < 0.00001) {
				this.rotZ = shearX * RAD_TO_DEG;

				if (a < 0 && d >= 0) {
					this.rotZ += (this.rotZ <= 0) ? DEG_PI : -DEG_PI;
				}

				this.shearX = this.shearY = 0.0;
			}
			else {
				this.rotZ = 0;
				this.shearX = shearX * RAD_TO_DEG;
				this.shearY = shearY * RAD_TO_DEG;
			}

			// next set scale
			this.scaleX = Math.sqrt((a * a) + (b * b));
			this.scaleY = Math.sqrt((c * c) + (d * d));

			// next set position
			this.posX = matrix.tx;
			this.posY = matrix.ty;
			this.pivotX = 0;
			this.pivotY = 0;

			return this;
		}
	}
}
