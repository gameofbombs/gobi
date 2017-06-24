namespace gobi.pixi {
	export const defaultTextureVertex =
		`precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

void main(void){
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    
    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}
`
}

namespace gobi.pixi.sprites {
	import UniformGroup = gobi.core.UniformGroup;
	const fragTemplate = [
		'varying vec2 vTextureCoord;',
		'varying vec4 vColor;',
		'varying float vTextureId;',
		'uniform sampler2D uSamplers[%count%];',

		'void main(void){',
		'vec4 color;',
		'float textureId = floor(vTextureId+0.5);',
		'%forloop%',
		'gl_FragColor = color * vColor;',
		'}',
	].join('\n');

	export function generateMultiTextureShader(gl: WebGLRenderingContext, maxTextures: number) {
		const sampleValues = new Int32Array(maxTextures);

		for (let i = 0; i < maxTextures; i++) {
			sampleValues[i] = i;
		}

		const uniforms = {
			default: UniformGroup.from({uSamplers: sampleValues}, true),
		};

		let fragmentSrc = fragTemplate;

		fragmentSrc = fragmentSrc.replace(/%count%/gi, maxTextures+'');
		fragmentSrc = fragmentSrc.replace(/%forloop%/gi, generateSampleSrc(maxTextures));

		return Shader.from(defaultTextureVertex, fragmentSrc, uniforms);
	}

	function generateSampleSrc(maxTextures: number) {
		let src = '';

		src += '\n';
		src += '\n';

		for (let i = 0; i < maxTextures; i++) {
			if (i > 0) {
				src += '\nelse ';
			}

			if (i < maxTextures - 1) {
				src += `if(textureId == ${i}.0)`;
			}

			src += '\n{';
			src += `\n\tcolor = texture2D(uSamplers[${i}], vTextureCoord);`;
			src += '\n}';
		}

		src += '\n';
		src += '\n';

		return src;
	}
}
