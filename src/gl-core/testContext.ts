namespace gobi.glCore {
	let context: WebGLRenderingContext = null;

	export function getTestContext() {
		if (context && !context.isContextLost()) {
			return context;
		}

		const canvas = document.createElement('canvas');

		let gl: WebGLRenderingContext = null;

		if (gobi.pixi.settings.PREFER_WEBGL_2)
		{
			gl = canvas.getContext('webgl2', {}) as WebGLRenderingContext;
		}

		if (!gl)
		{
			gl = canvas.getContext('webgl', {})
				|| canvas.getContext('experimental-webgl', {});

			if (!gl)
			{
				// fail, not able to get a context
				throw new Error('This browser does not support webGL. Try using the canvas renderer');
			}
			else
			{
				// for shader testing..

				gl.getExtension('OES_texture_float');
				// gl.getExtension('WEBGL_draw_buffers');
			}
		}

		context = gl;

		return gl;
	}
}
