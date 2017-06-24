namespace gobi.core {

	/**
	 * Transform that takes care about its versions
	 */
	export class Transform {
		/**
		 * Updates local matrix in the updateTransform method. Switch it to 'false' if you form local matrix some other way
		 *
		 * TODO: make it work and make some tests
		 */
		autoUpdateLocal = true;

		/**
		 * called from invalidate
		 */
		node: ILazyNodeBase;

		flat = new FlatTransform2d();

		localTransform = this.flat.matrix;
		/**
		 * The global matrix transform. It can be swapped temporarily by some functions like getLocalBounds()
		 */
		worldTransform = new Matrix();

		/**
		 * The local matrix transform
		 */
		_worldID: number = 0;
		_localID: number = 0;
		_currentLocalID: number = 0;

		/**
		 * The coordinate of the object relative to the local coordinates of the parent.
		 */
		position: IPoint = new transform.PointProxyPosition(this, this.flat);

		/**
		 * The scale factor of the object.
		 */
		scale: IPoint = new transform.PointProxyScale(this, this.flat);

		/**
		 * The pivot point of the displayObject that it rotates around
		 */
		pivot: IPoint = new transform.PointProxyPivot(this, this.flat);

		/**
		 * Shear, in degrees, on the X and Y axis.
		 */
		shear: IPoint = new transform.PointProxyShear(this, this.flat);

		/**
		 * The skew amount, in degrees, on the X and Y axis. Equals to (-shearY, shearX)
		 */
		skew: IPoint = new transform.PointProxySkew(this, this.flat);

		constructor(node?: ILazyNodeBase) {
			this.node = node || null;
		}

		/**
		 * Called when a value changes.
		 *
		 * @private
		 */
		invalidate(rotationChanged?: boolean) {
			if (rotationChanged) {
				this.flat.updateRotation();
			}
			const last = this._localID++;
			if (last == this._currentLocalID) {
				if (this.node) {
					this.node.invalidate(COMPONENT_BITS.TRANSFORM);
				} else {
					this.updateLocalTransform();
				}
			}
		}

		/**
		 * Updates only local matrix
		 */
		updateLocalTransform() {
			const lt = this.localTransform;

			if (this._localID === this._currentLocalID) {
				return;
			}

			this.flat.update(false);

			this._currentLocalID = this._localID;
		}

		/**
		 * Updates the values of the object and applies the parent's transform.
		 */
		updateTransform(parentTransform: Transform) {
			const pt = parentTransform.worldTransform;
			const wt = this.worldTransform;
			const lt = this.localTransform;
			if (this._localID !== this._currentLocalID && this.autoUpdateLocal) {
				this.flat.update(false);
				this._currentLocalID = this._localID;
			}
			wt.setToMult(pt, lt);
			this._worldID++;
		}

		/**
		 * Decomposes a matrix and sets the transforms properties based on it.
		 *
		 * @param {PIXI.Matrix} matrix - The matrix to decompose
		 */
		setFromMatrix(matrix: Matrix) {
			this.flat.decompose(matrix);
			this.invalidate(true);
		}

		/**
		 * The rotation of the object in radians.
		 *
		 * @member {number}
		 * @memberof PIXI.TransformStatic#
		 */
		get rotation() {
			return this.flat.rotZ;
		}

		/**
		 * Sets the rotation of the transform.
		 *
		 * @param {number} value - The value to set to.
		 */
		set rotation(value) {
			if (this.flat.rotZ !== value) {
				this.flat.rotZ = value;
				this.invalidate(true);
			}
		}

		static IDENTITY = new Transform();
	}
}
