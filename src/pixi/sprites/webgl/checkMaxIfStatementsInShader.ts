namespace gobi.pixi.sprites {
	const fragTemplate = [
		'precision mediump float;',
		'void main(void){',
		'float test = 0.1;',
		'%forloop%',
		'gl_FragColor = vec4(0.0);',
		'}',
	].join('\n');

	export function checkMaxIfStatementsInShader(maxIfs: number, gl: WebGLRenderingContext) {
		const shader = gl.createShader(gl.FRAGMENT_SHADER);

		while (true) // eslint-disable-line no-constant-condition
		{
			const fragmentSrc = fragTemplate.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));

			gl.shaderSource(shader, fragmentSrc);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				maxIfs = (maxIfs / 2) | 0;
			}
			else {
				// valid!
				break;
			}
		}

		return maxIfs;
	}

	function generateIfTestSrc(maxIfs: number) {
		let src = '';

		for (let i = 0; i < maxIfs; ++i) {
			if (i > 0) {
				src += '\nelse ';
			}

			if (i < maxIfs - 1) {
				src += `if(test == ${i}.0){}`;
			}
		}

		return src;
	}
}
