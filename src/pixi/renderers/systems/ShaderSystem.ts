namespace gobi.pixi.systems {
	import Rectangle = gobi.core.Rectangle;
	import GLShader = gobi.glCore.GLShader;
	import generateUniformsSync = gobi.glCore.shaderUtils.generateUniformsSync;
	import UniformGroup = gobi.core.UniformGroup;

	export class ShaderSystem extends BaseSystem {
		gl: WebGLRenderingContext = null;
		CONTEXT_UID: number;

		shader: Shader = null;
		program: Program = null;

		constructor(renderer: WebGLRenderer) {
			super(renderer);
		}

		contextChange(gl: WebGLRenderingContext) {
			this.removeAll(true);
			this.gl = gl;
			this.CONTEXT_UID = this.renderer.CONTEXT_UID;
			this.program = null;
		}

		/**
		 * Changes the current shader to the one given in parameter
		 *
		 * @param {PIXI.Shader} shader - the new shader
		 * @param {boolean} dontSync - false if the shader should automatically sync its uniforms.
		 * @returns {PIXI.glCore.GLShader} the glShader that belongs to the shader.
		 */
		bind(shader: Shader, dontSync?: boolean) {
			// maybe a better place for this...
			shader.uniforms.globals = this.renderer.globalUniforms;

			const program = shader.program;
			const glShader = program.glShaders[this.renderer.CONTEXT_UID] || this.generateShader(program);

			this.shader = shader;

			// TODO - some current pixi plugins bypass this.. so it not safe to use yet..
			if (this.program !== program) {
				this.program = program;
				glShader.bind();
			}

			if (!dontSync) {
				this.syncUniformGroup(shader.uniformGroup);
			}

			return glShader;
		}

		/**
		 * Uploads the uniforms values to the currently bound shader.
		 *
		 * @param {object} uniforms - the uniforms valiues that be applied to the current shader
		 */
		// setUniforms(uniforms) {
		// 	const shader = this.shader.program;
		// 	const glShader = shader.glShaders[this.renderer.CONTEXT_UID];
		//
		// 	shader.syncUniforms(glShader.uniformData, uniforms, this.renderer);
		// }

		syncUniformGroup(group: UniformGroup) {
			const glShader = this.getGLShader();

			if (!group._static || group.dirtyId !== glShader.uniformGroups[group.id]) {
				glShader.uniformGroups[group.id] = group.dirtyId;
				const syncFunc = group.syncUniforms[this.shader.program.uniqId] || this.createSyncGroups(group) as any;

				syncFunc(glShader.uniformData, group.uniforms, this.renderer);
			}
		}

		createSyncGroups(group: UniformGroup) {
			group.syncUniforms[this.shader.program.uniqId] = generateUniformsSync(group, this.shader.program.uniformData);

			return group.syncUniforms[this.shader.program.uniqId];
		}

		/**
		 * Returns the underlying GLShade rof the currently bound shader.
		 * This can be handy for when you to have a little more control over the setting of your uniforms.
		 *
		 * @return {PIXI.glCore.Shader} the glShader for the currently bound Shader for this context
		 */
		getGLShader(): GLShader {
			if (this.shader) {
				return this.shader.program.glShaders[this.renderer.CONTEXT_UID];
			}

			return null;
		}

		/**
		 * Generates a GLShader verion of the Shader provided.
		 *
		 * @private
		 * @param {PIXI.Shader} shader the shader that the glShader will be based on.
		 * @return {PIXI.glCore.GLShader} A shiney new GLShader
		 */
		generateShader(program: Program) {
			const attribMap: any = {};

			// insert the global properties too!

			for (const i in program.attributeData) {
				attribMap[i] = program.attributeData[i].location;
			}

			const glShader = new GLShader(this.gl,
				program.vertexSrc,
				program.fragmentSrc,
				settings.PRECISION_FRAGMENT,
				attribMap);

			program.glShaders[this.renderer.CONTEXT_UID] = glShader;

			this.managedPrograms[program.uniqId] = program;
			program.onDispose.addListener(this.destroyProgram);

			return glShader;
		}

		destroyed: boolean = false;

		/**
		 * Destroys this System and removes all its textures
		 */
		destroy() {
			// TODO implement destroy method for ShaderSystem
			this.destroyed = true;
		}

		managedPrograms: { [key: number]: Program } = {};

		destroyProgram = (program: Program, contextLost: boolean = false) => {
			delete this.managedPrograms[program.uniqId];

			let glShader = program.glShaders[this.CONTEXT_UID];
			if (glShader) {
				if (!contextLost) {
					this.gl.deleteProgram(glShader.program);
				}
				program.onDispose.removeListener(this.destroyProgram);
				delete program.glShaders[this.CONTEXT_UID];
			}
		};

		removeAll(contextLost: boolean = false) {
			let all = Object.keys(this.managedPrograms);
			for (let key of all) {
				this.destroyProgram(this.managedPrograms[key as any], contextLost);
			}
		}
	}
}
