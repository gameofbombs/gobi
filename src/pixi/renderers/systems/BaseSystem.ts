namespace gobi.pixi.systems {
	export class BaseSystem {
		renderer: WebGLRenderer;

		constructor(renderer: WebGLRenderer) {
			this.renderer = renderer;
		}
	}
}
