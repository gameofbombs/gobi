namespace gobi.pixi {
	import PandaTicker = gobi.panda.PandaTicker;
	/**
	 * Convenience class to create a new PIXI application.
	 * This class automatically creates the renderer, ticker
	 * and root container.
	 *
	 * @example
	 * // Create the application
	 * const app = new PIXI.Application();
	 *
	 * // Add the view to the DOM
	 * document.body.appendChild(app.view);
	 *
	 * // ex, add display objects
	 * app.stage.addChild(PIXI.Sprite.fromImage('something.png'));
	 *
	 * @class
	 * @memberof PIXI
	 */
	export class Application {
		_options: any;
		renderer: WebGLRenderer;
		stage: Stage;
		_ticker: PandaTicker = null;
		interaction: interaction.Manager;

		// eslint-disable-next-line valid-jsdoc
		/**
		 * @param {object} [options] - The optional renderer parameters
		 * @param {number} [options.width=800] - the width of the renderers view
		 * @param {number} [options.height=600] - the height of the renderers view
		 * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
		 * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
		 * @param {boolean} [options.antialias=false] - sets antialias (only applicable in chrome at the moment)
		 * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
		 *      need to call toDataUrl on the webgl context
		 * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
		 * @param {boolean} [options.forceCanvas=false] - prevents selection of WebGL renderer, even if such is present
		 * @param {boolean} [options.legacy=false] - If true Pixi will aim to ensure compatibility
		 * with older / less advanced devices. If you experience unexplained flickering try setting this to true.
		 * @param {boolean} [options.sharedTicker=false] - `true` to use PIXI.ticker.shared, `false` to create new ticker.
		 * @param {boolean} [options.sharedLoader=false] - `true` to use PIXI.loaders.shared, `false` to create new Loader.
		 */
		constructor(options: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) {
			// Support for constructor(width, height, options, noWebGL, useSharedTicker)
			if (typeof options === 'number') {
				options = (Object as any).assign({
					width: options,
					height: arg2 || settings.RENDER_OPTIONS.height,
					forceCanvas: !!arg4,
					sharedTicker: !!arg5,
				}, arg3);
			}

			this._options = options = (Object as any).assign({
				sharedTicker: false,
				forceCanvas: false,
				sharedLoader: false,
			}, options);

			this.renderer = new WebGLRenderer(options);

			this.interaction = new interaction.Manager(this.renderer);

			this.stage = new Stage();

			/**
			 * Ticker for doing render updates.
			 * @member {PIXI.ticker.Ticker}
			 * @default PIXI.ticker.shared
			 */
			this.ticker = /*options.sharedTicker ? shared :*/ new PandaTicker();

			// Start the rendering
			this.start();
		}

		set ticker(ticker: PandaTicker) // eslint-disable-line require-jsdoc
		{
			if (this._ticker) {
				this._ticker.onEnterFrame.removeListener(this.render);
				this._ticker.onEnterFrame.removeListener(this.interact);
			}
			this._ticker = ticker;
			if (ticker) {
				ticker.onEnterFrame.addListener(this.render, UPDATE_PRIORITY.LOW);
				ticker.onEnterFrame.addListener(this.interact, UPDATE_PRIORITY.INTERACTION);
			}
		}

		get ticker() // eslint-disable-line require-jsdoc
		{
			return this._ticker;
		}

		/**
		 * Render the current stage.
		 */
		render = () => {
			this.renderer.render(this.stage);
		};

		interact = (millisecondsDelta: number) => {
			this.interaction.update(millisecondsDelta);
		};

		/**
		 * Convenience method for stopping the render.
		 */
		stop() {
			this._ticker.stop();
		}

		/**
		 * Convenience method for starting the render.
		 */
		start() {
			this._ticker.start();
		}

		/**
		 * Reference to the renderer's canvas element.
		 * @member {HTMLCanvasElement}
		 * @readonly
		 */
		get view() {
			return this.renderer.view;
		}

		/**
		 * Reference to the renderer's screen rectangle. Its safe to use as filterArea or hitArea for whole screen
		 * @member {PIXI.Rectangle}
		 * @readonly
		 */
		get screen() {
			return this.renderer.screen;
		}

		/**
		 * Destroy and don't use after this.
		 * @param {Boolean} [removeView=false] Automatically remove canvas from DOM.
		 */
		destroy(removeView: boolean) {
			const oldTicker = this._ticker;

			this.ticker = null;

			oldTicker.destroy();

			this.stage.destroy();
			this.stage = null;

			this.renderer.destroy(removeView);
			this.renderer = null;

			this._options = null;
		}
	}
}
