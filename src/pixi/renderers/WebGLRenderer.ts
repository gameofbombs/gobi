namespace gobi.pixi {
	import runner = gobi.core.runner;
	import UniformGroupCast = gobi.core.UniformGroupCast;
	import Matrix = gobi.core.Matrix;
	import WebGLSystem = gobi.pixi.systems.BaseSystem;

	export namespace webgl {
		/**
		 * you can override that interface, add more plugins here
		 */
		export interface RendererPlugins {
			[key: string]: any
		}

		export interface GlobalUniforms {
			projectionMatrix: Matrix;
		}
	}

	export class WebGLRenderer extends SystemRenderer {
		gl: WebGLRenderingContext = null;
		CONTEXT_UID: number = 0;
		runners = {
			destroy: runner.create0('destroy'),
			contextChange: runner.create1<WebGLRenderingContext>('contextChange'),
			reset: runner.create0('reset'),
			update: runner.create0('update'),
			postrender: runner.create0('postrender'),
			prerender: runner.create0('prerender'),
			resize: runner.create2<number, number>('resize'),
		};

		globalUniforms = new UniformGroupCast<webgl.GlobalUniforms>({
			projectionMatrix: new Matrix(),
		}, true);

		allSystems: { [key: string]: WebGLSystem } = {};

		state = new systems.StateSystem(this);
		context = new systems.ContextSystem(this);
		projection = new systems.ProjectionSystem(this);
		shader = new systems.ShaderSystem(this);
		framebuffer = new systems.FrameBufferSystem(this);
		texture = new systems.TextureSystem(this);
		batch = new systems.BatchSystem(this);
		geometry = new systems.GeometrySystem(this);

		renderingToScreen = true;

		constructor(options: IRendererOptions, arg2?: any, arg3?: any) {
			super('WebGL', options, arg2, arg3);

			runner.create0('destroy');

			/**
			 * The type of this renderer as a standardised const
			 *
			 * @member {number}
			 * @see PIXI.RENDERER_TYPE
			 */
			this.type = RENDERER_TYPE.WEBGL;

			this._backgroundColorRgba[3] = this.transparent ? 0 : 1;

			this.addSystemInstance(this.context, 'context')
				.addSystemInstance(this.state, 'state')
				.addSystemInstance(this.shader, 'shader')
				.addSystemInstance(this.texture, 'texture')
				.addSystemInstance(this.geometry, 'geometry')
				.addSystemInstance(this.framebuffer, 'framebuffer')
				.addSystemInstance(this.projection, 'projection')
				.addSystemInstance(this.batch, 'batch');

			// this.addSystem(MaskSystem, 'mask')
			// 	.addSystem(ContextSystem, 'context')
			// 	.addSystem(StateSystem, 'state')
			// 	.addSystem(ShaderSystem, 'shader')
			// 	.addSystem(TextureSystem, 'texture')
			// 	.addSystem(GeometrySystem, 'geometry')
			// 	.addSystem(FramebufferSystem, 'framebuffer')
			// 	.addSystem(StencilSystem, 'stencil')
			// 	.addSystem(ProjectionSystem, 'projection')
			// 	// .addSystem(TextureGCSystem)
			// 	.addSystem(FilterSystem, 'filter')
			// 	.addSystem(RenderTextureSystem, 'renderTexture')
			// 	.addSystem(BatchSystem, 'batch');

			this.initPlugins();

			/**
			 * The options passed in to create a new webgl context.
			 *
			 * @member {object}
			 * @private
			 */
			if (options.context) {
				this.context.initFromContext(options.context);
			}
			else {
				this.context.initFromOptions({
					alpha: this.transparent,
					antialias: options.antialias,
					premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
					stencil: true,
					preserveDrawingBuffer: options.preserveDrawingBuffer,
				});
			}

			this._initContext();

			gobi.utils.sayHello(this.context.webGLVersion === 2 ? 'WebGL 2' : 'WebGL 1');
		}

		addSystemInstance(_inst: WebGLSystem, name: string): WebGLRenderer {
			if (this.allSystems[name]) {
				throw new Error(`Whoops! ${name} is already a manager`);
			}

			this.allSystems[name] = _inst;

			for (const i in this.runners) {
				(this.runners as any)[i].add(_inst);
			}

			return this;
		}

		addSystem(_class: any, name?: string): WebGLRenderer {
			if (!name) {
				name = _class.name;
			}

			const system = new _class(this);

			if (this.allSystems[name]) {
				throw new Error(`Whoops! ${name} is already a manager`);
			}

			this.allSystems[name] = system;

			for (const i in this.runners) {
				(this.runners as any)[i].add(system);
			}

			return this;
		}

		/**
		 * Creates the WebGL context
		 *
		 * @private
		 */
		_initContext() {
			const gl = this.gl;

			this.resize(this.screen.width, this.screen.height);

			this.runners.contextChange.run(gl);
		}

		/**
		 * Renders the object to its webGL view
		 *
		 * @param {PIXI.DisplayObject} displayObject - the object to be rendered
		 * @param {PIXI.RenderTexture} renderTexture - The render texture to render to.
		 * @param {boolean} [clear] - Should the canvas be cleared before the new render
		 * @param {PIXI.Transform} [transform] - A transform to apply to the render texture before rendering.
		 * @param {boolean} [skipUpdateTransform] - Should we skip the update transform pass?
		 */
		render(displayObject: Container, renderTexture?: any, clear?: boolean, transform?: Matrix, skipUpdateTransform?: boolean) {
			// can be handy to know!
			this.renderingToScreen = !renderTexture;

			this.runners.prerender.run();
			// no point rendering if our context has been blown up!
			if (this.context.isLost) {
				return;
			}

			if (!renderTexture) {
				this._lastObjectRendered = displayObject;
			}

			if (!skipUpdateTransform) {
				// update the scene graph
				displayObject.updateTransform();
				// displayObject.hitArea = //TODO add a temp hit area
			}

			// if (clear !== undefined ? clear : this.clearBeforeRender) {
			// 	this.renderTexture.clear();
			// }

			// this.renderTexture.bind(renderTexture);

			const gl = this.gl;

			if (clear !== undefined ? clear : this.clearBeforeRender) {
				let c = this._backgroundColorRgba;
				gl.clearColor(c[0], c[1], c[2], c[3]);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			}

			gl.viewport(0, 0, this.screen.width, this.screen.height);

			this.projection.update(this.screen, this.screen, this.resolution, true);

			this.batch.currentRenderer.start();

			displayObject.renderBehaviour.renderWebGL(this, displayObject);

			this.batch.currentRenderer.flush();

			this.runners.postrender.run();
		}

		/**
		 * Resizes the webGL view to the specified width and height.
		 *
		 * @param {number} screenWidth - the new width of the screen
		 * @param {number} screenHeight - the new height of the screen
		 */
		resize(screenWidth: number, screenHeight: number) {
			SystemRenderer.prototype.resize.call(this, screenWidth, screenHeight);
			this.runners.resize.run(screenWidth, screenHeight);
		}

		/**
		 * Resets the WebGL state so you can render things however you fancy!
		 *
		 * @return {PIXI.WebGLRenderer} Returns itself.
		 */
		reset() {
			this.runners.reset.run();

			return this;
		}

		/**
		 * Removes everything from the renderer (event listeners, spritebatch, etc...)
		 *
		 * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
		 *  See: https://github.com/pixijs/pixi.js/issues/2233
		 */
		destroy(removeView?: boolean) {
			this.runners.destroy.run();

			// call base destroy
			super.destroy(removeView);

			// TODO nullify all the managers...
			this.gl = null;
		}

		//=== PLUGIN TARGET MIXIN ===

		plugins?: webgl.RendererPlugins = {} as any;

		static __plugins: { [key: string]: any } = {};

		static registerPlugin(pluginName: string, ctor: any) {
			(WebGLRenderer.__plugins as any)[pluginName] = ctor;
		}

		initPlugins() {
			this.plugins = this.plugins || {};

			for (const o in WebGLRenderer.__plugins) {
				let inst = new ((WebGLRenderer.__plugins as any)[o])(this);
				(this.plugins as any)[o] = inst;
				for (const i in this.runners) {
					(this.runners as any)[i].add(inst);
				}
			}
		}
	}
}
