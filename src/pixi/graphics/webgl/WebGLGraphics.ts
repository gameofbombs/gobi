namespace gobi.pixi.graphicsUtils {
	export class WebGLGraphics {
		lastIndex = 0;

		data: Array<WebGLGraphicsData> = [];

		gl: WebGLRenderingContext = null;

		clearDirty = -1;

		dirty = -1;

		constructor(gl: WebGLRenderingContext) {
			this.gl = gl;
		}
	}
}
