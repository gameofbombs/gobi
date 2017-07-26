///ts:ref=textUtils
/// <reference path="./textUtils.ts"/> ///ts:ref:generated

namespace gobi.pixi {
	import Bounds = gobi.core.Bounds;
	import CanvasResource = gobi.core.CanvasResource;
	import trimCanvas = gobi.pixi.textUtils.trimCanvas;
	const defaultDestroyOptions = {
		texture: true,
		children: false,
		baseTexture: true,
	};

	/**
	 * A Text Object will create a line or multiple lines of text. To split a line you can use '\n' in your text string,
	 * or add a wordWrap property set to true and and wordWrapWidth property with a value in the style object.
	 *
	 * A Text can be created directly from a string and a style object
	 *
	 * ```js
	 * let text = new PIXI.Text('This is a pixi text',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
	 * ```
	 *
	 * @class
	 * @extends PIXI.Sprite
	 * @memberof PIXI
	 */
	export class TextDisplayObject extends SpriteDisplayObject {
		canvas: HTMLCanvasElement;
		context: CanvasRenderingContext2D;

		resolution: number = settings.RESOLUTION;
		_text: string = null;
		_style: TextStyle = null;
		_styleListener: Function = null;
		_font: string = '';

		localStyleID: number;
		dirty: boolean = false;

		/**
		 * @param {string} text - The string that you would like the text to display
		 * @param {object|PIXI.TextStyle} [style] - The style parameters
		 * @param {HTMLCanvasElement} [canvas] - The canvas element for drawing text
		 */
		constructor(node: Container, text: string, style?: TextStyleOptions, canvas?: HTMLCanvasElement) {
			super(node);

			canvas = canvas || document.createElement('canvas');

			canvas.width = 3;
			canvas.height = 3;

			//TODO caching for text
			const texture = new Texture(new BaseTexture(new CanvasResource(canvas)).setTag("text"));

			texture.orig = new Rectangle();
			texture.trim = new Rectangle();

			this.texture = texture;

			//TODO caching for text
			// base texture is already automatically added to the cache, now adding the actual texture
			// Texture.addToCache(this._texture, this._texture.baseTexture.textureCacheIds[0]);

			/**
			 * The canvas element that everything is drawn to
			 *
			 * @member {HTMLCanvasElement}
			 */
			this.canvas = canvas;

			/**
			 * The canvas 2d context that everything is drawn with
			 * @member {CanvasRenderingContext2D}
			 */
			this.context = this.canvas.getContext('2d');

			this.text = text;
			this.style = style as any;
		}

		/**
		 * Renders text and updates it when needed.
		 *
		 * @private
		 * @param {boolean} respectDirty - Whether to abort updating the text if the Text isn't dirty and the function is called.
		 */
		updateText(respectDirty: boolean) {
			const style = this._style;

			// check if style has changed..
			if (this.localStyleID !== style.styleID) {
				this.dirty = true;
				this.localStyleID = style.styleID;
			}

			if (!this.dirty && respectDirty) {
				return;
			}

			this._font = this._style.toFontString();

			const context = this.context;
			const measured = TextMetrics.measureText(this._text, this._style, this._style.wordWrap, this.canvas);
			const width = measured.width;
			const height = measured.height;
			const lines = measured.lines;
			const lineHeight = measured.lineHeight;
			const lineWidths = measured.lineWidths;
			const maxLineWidth = measured.maxLineWidth;
			const fontProperties = measured.fontProperties;

			this.canvas.width = Math.ceil((width + (style.padding * 2)) * this.resolution);
			this.canvas.height = Math.ceil((height + (style.padding * 2)) * this.resolution);

			context.scale(this.resolution, this.resolution);

			context.clearRect(0, 0, this.canvas.width, this.canvas.height);

			context.font = this._font;
			const anyStroke = style.stroke  as any;
			context.strokeStyle = anyStroke;
			context.lineWidth = style.strokeThickness;
			context.textBaseline = style.textBaseline;
			context.lineJoin = style.lineJoin;
			context.miterLimit = style.miterLimit;

			let linePositionX;
			let linePositionY;

			if (style.dropShadow) {
				const anyShadowColor = style.dropShadowColor  as any;
				context.fillStyle = anyShadowColor;
				context.globalAlpha = style.dropShadowAlpha;
				context.shadowBlur = style.dropShadowBlur;

				if (style.dropShadowBlur > 0) {
					context.shadowColor = anyShadowColor;
				}

				const xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
				const yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

				for (let i = 0; i < lines.length; i++) {
					linePositionX = style.strokeThickness / 2;
					linePositionY = ((style.strokeThickness / 2) + (i * lineHeight)) + fontProperties.ascent;

					if (style.align === 'right') {
						linePositionX += maxLineWidth - lineWidths[i];
					}
					else if (style.align === 'center') {
						linePositionX += (maxLineWidth - lineWidths[i]) / 2;
					}

					if (style.fill) {
						this.drawLetterSpacing(
							lines[i],
							linePositionX + xShadowOffset + style.padding, linePositionY + yShadowOffset + style.padding
						);

						if (style.stroke && style.strokeThickness) {
							context.strokeStyle = anyShadowColor;
							this.drawLetterSpacing(
								lines[i],
								linePositionX + xShadowOffset + style.padding, linePositionY + yShadowOffset + style.padding,
								true
							);
							context.strokeStyle = anyStroke;
						}
					}
				}
			}

			//in case we have multiple shadows

			if (style.multiShadow) {
				const multi = style.multiShadow;
				for (let i = 0; i < multi.length; i++) {
					const inst = multi[i];
					const anyShadowColor = style.dropShadowColor  as any;
					context.fillStyle = anyShadowColor;
					context.globalAlpha = inst.alpha || style.dropShadowAlpha;
					context.shadowBlur = style.dropShadowBlur;

					if (style.dropShadowBlur > 0) {
						context.shadowColor = anyShadowColor;
					}

					const xShadowOffset = inst.x;
					const yShadowOffset = inst.y;

					for (let i = 0; i < lines.length; i++) {
						linePositionX = style.strokeThickness / 2;
						linePositionY = ((style.strokeThickness / 2) + (i * lineHeight)) + fontProperties.ascent;

						if (style.align === 'right') {
							linePositionX += maxLineWidth - lineWidths[i];
						}
						else if (style.align === 'center') {
							linePositionX += (maxLineWidth - lineWidths[i]) / 2;
						}

						if (style.fill) {
							this.drawLetterSpacing(
								lines[i],
								linePositionX + xShadowOffset + style.padding, linePositionY + yShadowOffset + style.padding
							);

							if (style.stroke && style.strokeThickness) {
								context.strokeStyle = anyShadowColor;
								this.drawLetterSpacing(
									lines[i],
									linePositionX + xShadowOffset + style.padding, linePositionY + yShadowOffset + style.padding,
									true
								);
								context.strokeStyle = anyStroke;
							}
						}
					}
				}
			}

			// reset the shadow blur and alpha that was set by the drop shadow, for the regular text
			context.shadowBlur = 0;
			context.globalAlpha = 1;

			// set canvas text styles
			context.fillStyle = this._generateFillStyle(style, lines);

			// draw lines line by line
			for (let i = 0; i < lines.length; i++) {
				linePositionX = style.strokeThickness / 2;
				linePositionY = ((style.strokeThickness / 2) + (i * lineHeight)) + fontProperties.ascent;

				if (style.align === 'right') {
					linePositionX += maxLineWidth - lineWidths[i];
				}
				else if (style.align === 'center') {
					linePositionX += (maxLineWidth - lineWidths[i]) / 2;
				}

				if (style.stroke && style.strokeThickness) {
					this.drawLetterSpacing(
						lines[i],
						linePositionX + style.padding,
						linePositionY + style.padding,
						true
					);
				}

				if (style.fill) {
					this.drawLetterSpacing(
						lines[i],
						linePositionX + style.padding,
						linePositionY + style.padding
					);
				}
			}

			this.updateTexture();
		}

		/**
		 * Render the text with letter-spacing.
		 * @param {string} text - The text to draw
		 * @param {number} x - Horizontal position to draw the text
		 * @param {number} y - Vertical position to draw the text
		 * @param {boolean} [isStroke=false] - Is this drawing for the outside stroke of the
		 *  text? If not, it's for the inside fill
		 * @private
		 */
		drawLetterSpacing(text: string, x: number, y: number, isStroke = false) {
			const style = this._style;

			// letterSpacing of 0 means normal
			const letterSpacing = style.letterSpacing;

			if (letterSpacing === 0) {
				if (isStroke) {
					this.context.strokeText(text, x, y);
				}
				else {
					this.context.fillText(text, x, y);
				}

				return;
			}

			const characters = String.prototype.split.call(text, '');
			let currentPosition = x;
			let index = 0;
			let current = '';

			while (index < text.length) {
				current = characters[index++];
				if (isStroke) {
					this.context.strokeText(current, currentPosition, y);
				}
				else {
					this.context.fillText(current, currentPosition, y);
				}
				currentPosition += this.context.measureText(current).width + letterSpacing;
			}
		}

		/**
		 * Updates texture size based on canvas size
		 *
		 * @private
		 */
		updateTexture() {
			const canvas = this.canvas;

			if (this._style.trim) {
				const trimmed = trimCanvas(canvas);

				canvas.width = trimmed.width;
				canvas.height = trimmed.height;
				this.context.putImageData(trimmed.data, 0, 0);
			}

			const texture = this._texture;
			const style = this._style;
			const padding = style.trim ? 0 : style.padding;
			const baseTexture = texture.baseTexture;

			baseTexture.resolution = this.resolution;

			texture.baseTexture.width = this.canvas.width / this.resolution;
			texture.baseTexture.height = this.canvas.height / this.resolution;
			texture.trim.width = texture._frame.width = baseTexture.width;
			texture.trim.height = texture._frame.height = baseTexture.height;

			texture.trim.x = -padding;
			texture.trim.y = -padding;

			texture.orig.width = texture._frame.width - (padding * 2);
			texture.orig.height = texture._frame.height - (padding * 2);

			// call sprite onTextureUpdate to update scale if _width or _height were set
			this._onTextureUpdate();

			baseTexture.update();

			this.dirty = false;
		}

		/**
		 * Renders the object using the WebGL renderer
		 *
		 * @param {PIXI.WebGLRenderer} renderer - The renderer
		 */
		renderWebGL(renderer: WebGLRenderer) {
			if (this.resolution !== renderer.resolution) {
				this.resolution = renderer.resolution;
				this.dirty = true;
			}

			this.updateText(true);

			super.renderWebGL(renderer);
		}

		/**
		 * calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
		 */
		_calculateBounds(bounds: Bounds) {
			this.updateText(true);
			this.calculateVertices();
			// if we have already done this on THIS frame.
			bounds.addQuad(this.vertexData);
		}

		/**
		 * Method to be called upon a TextStyle change.
		 * @private
		 */
		_onStyleChange() {
			this.dirty = true;
		}

		/**
		 * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
		 *
		 * @private
		 * @param {object} style - The style.
		 * @param {string[]} lines - The lines of text.
		 * @return {string|number|CanvasGradient} The fill style
		 */
		_generateFillStyle(style: TextStyleOptions, lines: string[]): string | CanvasGradient {
			if (!Array.isArray(style.fill)) {
				return style.fill as string;
			}

			const arr = style.fill as Array<string>;

			// cocoon on canvas+ cannot generate textures, so use the first colour instead
			if (navigator.isCocoonJS) {
				return style.fill[0];
			}

			// the gradient will be evenly spaced out according to how large the array is.
			// ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
			let gradient;
			let totalIterations;
			let currentIteration;
			let stop;

			const width = this.canvas.width / this.resolution;
			const height = this.canvas.height / this.resolution;

			// make a copy of the style settings, so we can manipulate them later
			const fill = arr.slice();
			const fillGradientStops = style.fillGradientStops.slice();

			// wanting to evenly distribute the fills. So an array of 4 colours should give fills of 0.25, 0.5 and 0.75
			if (!fillGradientStops.length) {
				const lengthPlus1 = fill.length + 1;

				for (let i = 1; i < lengthPlus1; ++i) {
					fillGradientStops.push(i / lengthPlus1);
				}
			}

			// stop the bleeding of the last gradient on the line above to the top gradient of the this line
			// by hard defining the first gradient colour at point 0, and last gradient colour at point 1
			fill.unshift(style.fill[0]);
			fillGradientStops.unshift(0);

			fill.push(style.fill[arr.length - 1]);
			fillGradientStops.push(1);

			if (style.fillGradientType === TEXT_GRADIENT.LINEAR_VERTICAL) {
				// start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
				gradient = this.context.createLinearGradient(width / 2, 0, width / 2, height);

				// we need to repeat the gradient so that each individual line of text has the same vertical gradient effect
				// ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875
				totalIterations = (fill.length + 1) * lines.length;
				currentIteration = 0;
				for (let i = 0; i < lines.length; i++) {
					currentIteration += 1;
					for (let j = 0; j < fill.length; j++) {
						if (typeof fillGradientStops[j] === 'number') {
							stop = (fillGradientStops[j] / lines.length) + (i / lines.length);
						}
						else {
							stop = currentIteration / totalIterations;
						}
						gradient.addColorStop(stop, fill[j]);
						currentIteration++;
					}
				}
			}
			else {
				// start the gradient at the center left of the canvas, and end at the center right of the canvas
				gradient = this.context.createLinearGradient(0, height / 2, width, height / 2);

				// can just evenly space out the gradients in this case, as multiple lines makes no difference
				// to an even left to right gradient
				totalIterations = fill.length + 1;
				currentIteration = 1;

				for (let i = 0; i < fill.length; i++) {
					if (typeof fillGradientStops[i] === 'number') {
						stop = fillGradientStops[i];
					}
					else {
						stop = currentIteration / totalIterations;
					}
					gradient.addColorStop(stop, fill[i]);
					currentIteration++;
				}
			}

			return gradient;
		}

		/**
		 * Destroys this text object.
		 * Note* Unlike a Sprite, a Text object will automatically destroy its baseTexture and texture as
		 * the majority of the time the texture will not be shared with any other Sprites.
		 *
		 * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
		 *  have been set to that value
		 * @param {boolean} [options.children=false] - if set to true, all the children will have their
		 *  destroy method called as well. 'options' will be passed on to those calls.
		 * @param {boolean} [options.texture=true] - Should it destroy the current texture of the sprite as well
		 * @param {boolean} [options.baseTexture=true] - Should it destroy the base texture of the sprite as well
		 */
		destroy(options?: any) {
			if (typeof options === 'boolean') {
				options = {children: options};
			}

			options = (Object as any).assign({}, defaultDestroyOptions, options);

			super.destroy(options);

			// make sure to reset the the context and canvas.. dont want this hanging around in memory!
			this.context = null;
			this.canvas = null;

			this._style = null;
		}

		/**
		 * Set the style of the text. Set up an event listener to listen for changes on the style
		 * object and mark the text as dirty.
		 *
		 * @member {object|PIXI.TextStyle}
		 */
		get style(): TextStyle {
			return this._style;
		}

		//TODO: i dont know what to do with it
		get styleOptions(): TextStyleOptions {
			return this._style;
		}

		set styleOptions(value: TextStyleOptions) {
			this.style = value as TextStyle;
		}


		set style(style: TextStyle) // eslint-disable-line require-jsdoc
		{
			const anyStyle = style as any || {};

			if (anyStyle instanceof TextStyle) {
				this._style = anyStyle
			}
			else {
				this._style = new TextStyle(anyStyle);
			}

			this.localStyleID = -1;
			this.dirty = true;
		}

		/**
		 * Set the copy for the text object. To split a line you can use '\n'.
		 *
		 * @member {string}
		 */
		get text() {
			return this._text;
		}

		set text(text) // eslint-disable-line require-jsdoc
		{
			text = String(text === '' || text === null || text === undefined ? ' ' : text);

			if (this._text === text) {
				return;
			}
			this._text = text;
			this.dirty = true;
		}
	}
}
