///ts:ref=TextureUvs
/// <reference path="./TextureUvs.ts"/> ///ts:ref:generated

namespace gobi.pixi {
	import Rectangle = gobi.core.Rectangle;

	export class Texture {
		noFrame = false;
		baseTexture: BaseTexture;
		_frame: Rectangle;
		trim: Rectangle;
		orig: Rectangle;
		valid = false;
		requiresUpdate = false;
		_uvs: TextureUvs = null;
		_rotate: number;
		_updateID: number = 0;

		transform: any = 0;

		onUpdate = new Signal<(tex: Texture) => void>();

		constructor(baseTexture: BaseTexture, frame?: Rectangle, orig?: Rectangle, trim?: Rectangle, rotate?: number) {
			if (!frame) {
				this.noFrame = true;
				frame = new Rectangle(0, 0, 1, 1);
			}

			this.baseTexture = baseTexture;

			this._frame = frame;

			this.trim = trim;

			this._uvs = null;

			this.orig = orig || frame;

			this._rotate = Number(rotate || 0);

			if (baseTexture.valid) {
				if (this.noFrame) {
					frame = new Rectangle(0, 0, baseTexture.width, baseTexture.height);

					// if there is no frame we should monitor for any base texture changes..
					baseTexture.onUpdate.addListener(this.onBaseTextureUpdated);
				}
				this.frame = frame;
			}
			else {
				baseTexture.onValidate.addListener(this.onBaseTextureUpdated);
			}

			/**
			 * Fired when the texture is updated. This happens if the frame or the baseTexture is updated.
			 *
			 * @event PIXI.Texture#update
			 * @protected
			 * @param {PIXI.Texture} texture - Instance of texture being updated.
			 */

			this._updateID = 0;

			/**
			 * Extra field for extra plugins. May contain clamp settings and some matrices
			 * @type {Object}
			 */
			this.transform = null;
		}

		/**
		 * Updates this texture on the gpu.
		 *
		 */
		update() {
			this.baseTexture.update();
		}

		/**
		 * Called when the base texture is updated
		 *
		 * @private
		 * @param {PIXI.BaseTexture} baseTexture - The base texture.
		 */
		onBaseTextureUpdated = (baseTexture: BaseTexture) => {
			this._updateID++;

			// TODO this code looks confusing.. boo to abusing getters and setters!
			if (this.noFrame) {
				this.frame = new Rectangle(0, 0, baseTexture.width, baseTexture.height);
			}
			else {
				this.frame = this._frame;
				// TODO maybe watch out for the no frame option
				// updating the texture will should update the frame if it was set to no frame..
			}

			this.onUpdate.emit(this);
		};

		destroyed = false;

		/**
		 * Destroys this texture
		 *
		 * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
		 */
		destroy(destroyBase: boolean) {
			this.destroyed = true;
			if (this.baseTexture) {
				if (destroyBase) {
					this.baseTexture.destroy();
				}

				this.baseTexture.onUpdate.removeListener(this.onBaseTextureUpdated);

				this.baseTexture = null;
			}

			this._frame = null;
			this._uvs = null;
			this.trim = null;
			this.orig = null;

			this.valid = false;
		}

		/**
		 * Creates a new texture object that acts the same as this one.
		 *
		 * @return {PIXI.Texture} The new texture
		 */
		clone() {
			return new Texture(this.baseTexture, this.frame, this.orig, this.trim, this.rotate);
		}

		/**
		 * Updates the internal WebGL UV cache.
		 *
		 * @protected
		 */
		_updateUvs() {
			if (!this._uvs) {
				this._uvs = new TextureUvs();
			}

			this._uvs.set(this._frame, this.baseTexture, this.rotate);

			this._updateID++;
		}

		get frame() {
			return this._frame;
		}

		set frame(frame) // eslint-disable-line require-jsdoc
		{
			this._frame = frame;

			this.noFrame = false;

			this.valid = this.baseTexture.valid;

			if (this.valid) {
				if (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height) {
					throw new Error('Texture Error: frame does not fit inside the base Texture dimensions: '
						+ `X: ${frame.x} + ${frame.width} > ${this.baseTexture.width} `
						+ `Y: ${frame.y} + ${frame.height} > ${this.baseTexture.height}`);
				}
			}

			if (!this.trim && !this.rotate) {
				this.orig = frame;
			}

			if (this.valid) {
				this._updateUvs();
			}
		}

		/**
		 * Indicates whether the texture is rotated inside the atlas
		 * set to 2 to compensate for texture packer rotation
		 * set to 6 to compensate for spine packer rotation
		 * can be used to rotate or mirror sprites
		 * See {@link PIXI.GroupD8} for explanation
		 *
		 * @member {number}
		 */
		get rotate() {
			return this._rotate;
		}

		set rotate(rotate) // eslint-disable-line require-jsdoc
		{
			this._rotate = rotate;
			if (this.valid) {
				this._updateUvs();
			}
		}

		/**
		 * The width of the Texture in pixels.
		 *
		 * @member {number}
		 */
		get width() {
			return this.orig.width;
		}

		/**
		 * The height of the Texture in pixels.
		 *
		 * @member {number}
		 */
		get height() {
			return this.orig.height;
		}

		static EMPTY = new Texture(new BaseTexture());
		static WHITE = new Texture(createWhiteTexture());

		static fromImage = cache.newTextureFromImg;
	}

	function emptyFunction() {
	}

	const emptySignal = new Signal<(tex: Texture) => void>() as any;
	emptySignal.addListener = emptyFunction;
	emptySignal.removeListener = emptyFunction;

	function createWhiteTexture() {
		const canvas = document.createElement('canvas');

		canvas.width = 10;
		canvas.height = 10;

		const context = canvas.getContext('2d');

		context.fillStyle = 'white';
		context.fillRect(0, 0, 10, 10);

		return new BaseTexture(new ImageLikeResource(canvas)).setTag("white");
	}

	function removeAllHandlers(tex: Texture) {
		tex.destroy = emptyFunction;
		tex.onUpdate = emptySignal;
		tex.baseTexture.onUpdate = emptySignal;
		tex.baseTexture.onValidate = emptySignal;
		tex.baseTexture.onDispose = emptySignal;
		tex.baseTexture.destroy = emptyFunction;

	}

	removeAllHandlers(Texture.EMPTY);
	removeAllHandlers(Texture.WHITE);
}
