///ts:ref=BaseSystem
/// <reference path="./BaseSystem.ts"/> ///ts:ref:generated
///ts:ref=ObjectRenderer
/// <reference path="./ObjectRenderer.ts"/> ///ts:ref:generated

namespace gobi.pixi {
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
}
