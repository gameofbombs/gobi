namespace gobi.pixi {
	import GLState = gobi.glCore.GLState;
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
