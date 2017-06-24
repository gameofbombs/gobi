///ts:ref=BaseSystem
/// <reference path="./BaseSystem.ts"/> ///ts:ref:generated

namespace gobi.pixi {
	import GLState = gobi.glCore.GLState;

	export namespace systems {
		export class BatchSystem extends BaseSystem {
			emptyRenderer: ObjectRenderer;
			currentRenderer: ObjectRenderer;

			constructor(renderer: WebGLRenderer) {
				super(renderer);

				this.emptyRenderer = new ObjectRenderer(renderer);

				this.currentRenderer = this.emptyRenderer;
			}

			setObjectRenderer(objectRenderer: ObjectRenderer) {
				if (this.currentRenderer === objectRenderer) {
					return;
				}

				this.currentRenderer.stop();
				this.currentRenderer = objectRenderer;

				this.renderer.state.setState(objectRenderer.state);

				this.currentRenderer.start();
			}

			/**
			 * This should be called if you wish to do some custom rendering
			 * It will basically render anything that may be batched up such as sprites
			 *
			 */
			flush() {
				this.setObjectRenderer(this.emptyRenderer);
			}

			reset() {
				this.setObjectRenderer(this.emptyRenderer);
			}
		}
	}

	export class ObjectRenderer extends systems.BaseSystem {
		state: GLState = null;

		/**
		 * Starts the renderer and sets the shader
		 *
		 */
		start() {
			// set the shader..
		}

		/**
		 * Stops the renderer
		 *
		 */
		stop() {
			this.flush();
		}

		/**
		 * Stub method for rendering content and emptying the current batch.
		 *
		 */
		flush() {
			// flush!
		}
	}
}
