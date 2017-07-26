///ts:ref=GLShader
/// <reference path="../gl-core/GLShader.ts"/> ///ts:ref:generated

namespace gobi.pixi {
	import GLShader = gobi.glCore.GLShader;
	import UniformGroup = gobi.core.UniformGroup;
	import shaderUtils = gobi.glCore.shaderUtils;
	import getTestContext = gobi.glCore.getTestContext;
	import ProgramCache = gobi.utils.ProgramCache;

	export class Program implements UniqIdMarked {
		uniqId = UniqIdGenerator.getUniq();
		onDispose = new Signal<(program: Program) => void>();

		vertexSrc: string = "";

		fragmentSrc: string = "";

		// this is where we store shader references..
		glShaders: { [key: number]: GLShader } = {};

		syncUniforms: UniformGroup = null;

		constructor(vertexSrc?: string, fragmentSrc?: string) {
			/**
			 * The vertex shader.
			 *
			 * @member {string}
			 */
			this.vertexSrc = vertexSrc || Program.defaultVertexSrc;

			/**
			 * The fragment shader.
			 *
			 * @member {string}
			 */
			this.fragmentSrc = fragmentSrc || Program.defaultFragmentSrc;

			// currently this does not extract structs only default types
			this.extractData(this.vertexSrc, this.fragmentSrc);
		}

		attributeData: any = null;
		uniformData: any = null;

		dispose() {
			this.onDispose.emit(this);
			this.onDispose.clear();
		}

		/**
		 * Extracts the data for a buy creating a small test program
		 * or reading the src directly.
		 * @private
		 *
		 * @param {string} [vertexSrc] - The source of the vertex shader.
		 * @param {string} [fragmentSrc] - The source of the fragment shader.
		 */
		extractData(vertexSrc: string, fragmentSrc: string) {
			const gl = getTestContext();

			if (!gl) {
				// uh oh! no webGL.. lets read uniforms from the strings..
				this.attributeData = {};
				this.uniformData = shaderUtils.extractUniformsFromSrc(vertexSrc, fragmentSrc);
			}
			else {
				vertexSrc = shaderUtils.setPrecision(vertexSrc, PRECISION.MEDIUM);
				fragmentSrc = shaderUtils.setPrecision(fragmentSrc, PRECISION.MEDIUM);

				const program = shaderUtils.compileProgram(gl, vertexSrc, fragmentSrc);

				this.attributeData = this.getAttributeData(program, gl);
				this.uniformData = this.getUniformData(program, gl);
				// gl.deleteProgram(program);
			}
		}

		/**
		 * returns the attribute data from the program
		 * @private
		 *
		 * @param {webGL-program} [program] - the webgl program
		 * @param {contex} [gl] - the webGL context
		 *
		 * @returns {object} the attribute data for this program
		 */
		getAttributeData(program: WebGLProgram, gl: WebGLRenderingContext) {
			const attributes : any = {};
			const attributesArray : Array<any> = [];

			const totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

			for (let i = 0; i < totalAttributes; i++) {
				const attribData = gl.getActiveAttrib(program, i);
				const type = shaderUtils.mapType(gl, attribData.type);

				/*eslint-disable */
				const data = {
					type: type,
					name: attribData.name,
					size: shaderUtils.mapSize(type),
					location: 0,
				};
				/*eslint-enable */

				attributes[attribData.name] = data;
				attributesArray.push(data);
			}

			attributesArray.sort((a, b) => (a.name > b.name) ? 1 : -1); // eslint-disable-line no-confusing-arrow

			for (let i = 0; i < attributesArray.length; i++) {
				attributesArray[i].location = i;
			}

			return attributes;
		}

		/**
		 * returns the uniform data from the program
		 * @private
		 *
		 * @param {webGL-program} [program] - the webgl program
		 * @param {contex} [gl] - the webGL context
		 *
		 * @returns {object} the uniform data for this program
		 */
		getUniformData(program: WebGLProgram, gl: WebGLRenderingContext) {
			const uniforms : any = {};

			const totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

			// TODO expose this as a prop?
			// const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');
			// const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');

			for (let i = 0; i < totalUniforms; i++) {
				const uniformData = gl.getActiveUniform(program, i);
				const name = uniformData.name.replace(/\[.*?\]/, '');

				const isArray = uniformData.name.match(/\[.*?\]/);
				const type = shaderUtils.mapType(gl, uniformData.type);

				/*eslint-disable */
				uniforms[name] = {
					type: type,
					size: uniformData.size,
					isArray: isArray,
					value: shaderUtils.defaultValue(type, uniformData.size),
				};
				/*eslint-enable */
			}

			return uniforms;
		}

		/**
		 * The default vertex shader source
		 *
		 * @static
		 * @constant
		 */
		static get defaultVertexSrc() {
			return [
				'attribute vec2 aVertexPosition;',
				'attribute vec2 aTextureCoord;',

				'uniform mat3 projectionMatrix;',

				'varying vec2 vTextureCoord;',

				'void main(void){',
				'   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
				'   vTextureCoord = aTextureCoord ;',
				'}',
			].join('\n');
		}

		/**
		 * The default fragment shader source
		 *
		 * @static
		 * @constant
		 */
		static get defaultFragmentSrc() {
			return [
				'varying vec2 vTextureCoord;',

				'uniform sampler2D uSampler;',

				'void main(void){',
				'   gl_FragColor *= texture2D(uSampler, vTextureCoord);',
				'}',
			].join('\n');
		}

		/**
		 * A short hand function to create a program based of a vertex and fragment shader
		 * this method will also check to see if there is a cached program.
		 *
		 * @param {string} [vertexSrc] - The source of the vertex shader.
		 * @param {string} [fragmentSrc] - The source of the fragment shader.
		 * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
		 *
		 * @returns {PIXI.Shader} an shiney new pixi shader.
		 */
		static from(vertexSrc?: string, fragmentSrc?: string) {
			const key = vertexSrc + '=^_^=' + fragmentSrc; //hashnya

			let program = ProgramCache[key];

			if (!program) {
				ProgramCache[key] = program = new Program(vertexSrc, fragmentSrc);
			}

			return program;
		}
	}
}
