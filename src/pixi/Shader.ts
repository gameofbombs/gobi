///ts:ref=GLShader
/// <reference path="../gl-core/GLShader.ts"/> ///ts:ref:generated

namespace gobi.pixi {
	import UniformGroup = gobi.core.UniformGroup;
	/**
	 * Wrapper class, webGL Shader for Pixi.
	 * Adds precision string if vertexSrc or fragmentSrc have no mention of it.
	 *
	 * @class
	 * @extends GLShader
	 * @memberof PIXI
	 */
	export class Shader {
		program: Program;
		uniformGroup: UniformGroup;

		constructor(program: Program, uniforms?: any) {
			this.program = program;

			// lets see whats been passed in
			// uniforms should be converted to a uniform group
			if (uniforms) {
				if (uniforms instanceof UniformGroup) {
					this.uniformGroup = uniforms;
				}
				else {
					this.uniformGroup = new UniformGroup(uniforms);
				}
			}
			else {
				this.uniformGroup = new UniformGroup({});
			}

			// time to build some getters and setters!
			// I guess down the line this could sort of generate an instruction list rather than use dirty ids?
			// does the trick for now though!
			for (const i in program.uniformData) {
				if (this.uniformGroup.uniforms[i] instanceof Array) {
					this.uniformGroup.uniforms[i] = new Float32Array(this.uniformGroup.uniforms[i]);
				}
			}
		}

		// TODO move to shader system..
		checkUniformExists(name: string, group: UniformGroup) {
			if (group.uniforms[name]) {
				return true;
			}

			for (const i in group.uniforms) {
				const uniform = group.uniforms[i];

				if (uniform.group) {
					if (this.checkUniformExists(name, uniform)) {
						return true;
					}
				}
			}

			return false;
		}

		destroy() {
			// usage count on programs?
			// remove if not used!
			this.uniformGroup = null;
		}

		get uniforms(): any {
			return this.uniformGroup.uniforms;
		}

		/**
		 * A short hand function to create a shader based of a vertex and fragment shader
		 *
		 * @param {string} [vertexSrc] - The source of the vertex shader.
		 * @param {string} [fragmentSrc] - The source of the fragment shader.
		 * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
		 *
		 * @returns {PIXI.Shader} an shiney new pixi shader.
		 */
		static from(vertexSrc: string, fragmentSrc: string, uniforms: any) {
			const program = Program.from(vertexSrc, fragmentSrc);

			return new Shader(program, uniforms);
		}
	}
}
