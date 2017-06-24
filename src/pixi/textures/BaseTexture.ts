namespace gobi.pixi {
	import GLTexture = gobi.glCore.GLTexture;
	import getUniq = UniqIdGenerator.getUniq;
	import IDisposable = gobi.core.IDisposable;

	export class BaseTexture implements UniqIdMarked, IDisposable {
		uniqId: number = UniqIdGenerator.getUniq();

		width: number;

		height: number;

		isPowerOfTwo = false;

		mipmap = false;

		forceUploadStyle = true;

		premultiplyAlpha = true;

		resolution = settings.RESOLUTION;

		wrapMode = settings.WRAP_MODE;

		scaleMode = settings.SCALE_MODE;

		format = gobi.core.FORMATS.RGBA;

		target = gobi.core.TARGETS.TEXTURE_2D;

		type = gobi.core.TYPES.UNSIGNED_BYTE;

		_glTextures: { [key: number]: GLTexture } = {};

		_updateID = 0;

		// for batches
		_batchId: number = 0;

		_batchEnabled: number = 0;

		valid = false;

		resource: ITextureResource = null;

		// tag for resource, allows to understand wtf is that thing
		tag: string = null;

		onDispose = new Signal<(tex: BaseTexture) => void>();

		onUpdate = new Signal<(tex: BaseTexture) => void>();

		onValidate = new Signal<(tex: BaseTexture) => void>();

		_cacheId: string = null;

		constructor(resource?: ITextureResource) {
			this.target = TARGETS.TEXTURE_2D; // gl.TEXTURE_2D

			this._glTextures = {};

			this.resource = resource;

			if (resource) {
				this.resource.onTextureNew(this);
			}
		}

		setStyle(scaleMode?: gobi.core.SCALE_MODES,
		         format?: gobi.core.FORMATS,
		         type?: gobi.core.TYPES,
		         mipmap?: boolean) {
			if (scaleMode !== undefined) {
				this.scaleMode = scaleMode;
			}
			if (format !== undefined) {
				this.format = format;
			}
			if (type !== undefined) {
				this.type = type;
			}
			if (mipmap !== undefined) {
				this.mipmap = mipmap;
			}
			return this;
		}

		setSize(width: number, height: number, resolution?: number) {
			this.width = width;
			this.height = height;
			this.resolution = resolution || this.resolution;
			this.isPowerOfTwo = gobi.utils.isPow2(this.realWidth) && gobi.utils.isPow2(this.realHeight);
			this.update();
			return this;
		}

		setTag(tag: string) {
			this.tag = tag;
			if (this.resource && this.resource.onTextureTag) {
				this.resource.onTextureTag(this);
			}
			return this;
		}

		setResource(resource: ITextureResource) {
			this.resource = resource;
			if (this.tag && this.resource.onTextureTag) {
				this.resource.onTextureTag(this);
			}
		}

		setRealSize(realWidth: number, realHeight: number) {
			this.width = realWidth / this.resolution;
			this.height = realHeight / this.resolution;
			this.isPowerOfTwo = gobi.utils.isPow2(this.realWidth) && gobi.utils.isPow2(this.realHeight);
			this.update();
		}

		update() {
			if (!this.valid) {
				if (this.width >= 0 && this.height >= 0) {
					this.valid = true;
					this.onValidate.emit(this);
					this.onValidate = null;
					this.onUpdate.emit(this);
				}
			} else {
				this._updateID++;
				this.onUpdate.emit(this);
			}
		}

		resize(width: number, height: number) {
			this.width = width;
			this.height = height;

			this.update();
		}

		get realWidth() {
			return this.width * this.resolution;
		}

		get realHeight() {
			return this.height * this.resolution;
		}

		destroyed = false;

		/**
		 * Destroys this base texture
		 *
		 */
		destroy(options?: any) {
			// remove and destroy the resource

			if (this.resource) {
				if (this.resource.onTextureDestroy &&
					!this.resource.onTextureDestroy(this)) {
					return;
				}
				this.resource = null;
			}
			this.destroyed = true;

			// finally let the webGL renderer know..
			this.dispose();
		}

		/**
		 * Frees the texture from WebGL memory without destroying this texture object.
		 * This means you can still use the texture later which will upload it to GPU
		 * memory again.
		 *
		 * @fires PIXI.BaseTexture#dispose
		 */
		dispose() {
			this.onDispose.emit(this);
		}

		static fromImage(src: string) {
			return gobi.pixi.cache.newBaseTextureFromImg(src);
		}
		//TODO: all froms
	}
}