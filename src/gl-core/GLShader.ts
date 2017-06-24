//ts:ref=compileProgram

namespace gobi.glCore {
	// import compileProgram = shader.compileProgram
	// import extractAttributes = shader.extractAttributes
	// import extractUniforms = shader.extractUniforms
	// import generateUniformAccessObject = shader.generateUniformAccessObject

	/**
	 * Helper class to create a webGL Shader
	 *
	 * @class
	 * @memberof PIXI.glCore
	 * @param gl {WebGLRenderingContext}
	 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
	 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
	 */
	export class GLShader {
		gl: WebGLRenderingContext;
		program: WebGLProgram;

		/**
		 * The attributes of the shader as an object containing the following properties
		 * {
         * 	type,
         * 	size,
         * 	location,
         * 	pointer
         * }
		 * @member {Object}
		 */
		attributes: any;

		/**
		 * The uniforms of the shader as an object containing the following properties
		 * {
	 * 	gl,
	 * 	data
	 * }
		 * @member {Object}
		 */
		uniforms: any;

		uniformData: any;

		vertexSrc: string;

		fragmentSrc: string;

		uniformGroups: any = {};

		constructor(gl: WebGLRenderingContext, vertexSrc: string, fragmentSrc: string, precision?: gobi.core.PRECISION, attributeLocations?: { [key: string]: number }) {
			/**
			 * The current WebGL rendering context
			 *
			 * @member {WebGLRenderingContext}
			 */
			this.gl = gl;

			if (precision) {
				vertexSrc = shaderUtils.setPrecision(vertexSrc, precision);
				fragmentSrc = shaderUtils.setPrecision(fragmentSrc, precision);
			}

			/**
			 * The shader program
			 *
			 * @member {WebGLProgram}
			 */
			// First compile the program..
			this.program = shaderUtils.compileProgram(gl, vertexSrc, fragmentSrc, attributeLocations);


			// next extract the attributes
			this.attributes = shaderUtils.extractAttributes(gl, this.program);

			this.uniformData = shaderUtils.extractUniforms(gl, this.program);

			this.uniforms = shaderUtils.generateUniformAccessObject(gl, this.uniformData);
		};

		/**
		 * Uses this shader
		 */
		bind() {
			this.gl.useProgram(this.program);
		}

		/**
		 * Destroys this shader
		 * TODO
		 */
		destroy() {
			// var gl = this.gl;
		}
	}
}
