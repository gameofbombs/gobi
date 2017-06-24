namespace gobi.pixi.systems {
	import Matrix = gobi.core.Matrix;
	import Rectangle = gobi.core.Rectangle;

	export class ProjectionSystem extends BaseSystem {
		projectionMatrix = new Matrix();

		destinationFrame: Rectangle = null;
		sourceFrame: Rectangle = null;
		defaultFrame: Rectangle = null;

		constructor(renderer: WebGLRenderer) {
			super(renderer);

			this.projectionMatrix = new Matrix();
		}

		update(destinationFrame?: Rectangle, sourceFrame?: Rectangle, resolution?: number, root?: boolean) {
			this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
			this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;

			this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root);

			this.renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix;
			this.renderer.globalUniforms.update();
		}

		/**
		 * Updates the projection matrix based on a projection frame (which is a rectangle)
		 *
		 * @param destinationFrame - The destination frame.
		 * @param sourceFrame - The source frame.
		 * @param [resolution=1] - backing buffer resolution
		 * @param [root] whether we are root
		 */
		calculateProjection(destinationFrame: Rectangle, sourceFrame: Rectangle, resolution: number = 1, root?: boolean) {
			const pm = this.projectionMatrix;

			pm.identity();

			// TODO: make dest scale source
			if (!root) {
				pm.a = 1 / destinationFrame.width * 2;
				pm.d = 1 / destinationFrame.height * 2;

				pm.tx = -1 - (sourceFrame.x * pm.a);
				pm.ty = -1 - (sourceFrame.y * pm.d);
			}
			else {
				pm.a = 1 / destinationFrame.width * 2;
				pm.d = -1 / destinationFrame.height * 2;

				pm.tx = -1 - (sourceFrame.x * pm.a);
				pm.ty = 1 - (sourceFrame.y * pm.d);
			}

			// apply the resolution..
			// TODO - prob should apply this to x and y too!
			pm.a *= resolution;
			pm.d *= resolution;
		}

		/**
		 * Sets the transform of the active render target to the given matrix
		 *
		 * @param {PIXI.Matrix} matrix - The transformation matrix
		 */
		setTransform()// matrix)
		{
			// this._activeRenderTarget.transform = matrix;
		}

	}
}
