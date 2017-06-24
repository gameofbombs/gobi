namespace gobi.pixi {
	import GLTexture = gobi.glCore.GLTexture;
	import IDisposable = gobi.core.IDisposable;

	export class ImageResource extends ImageLikeResource<HTMLImageElement> {
		source: HTMLImageElement;

		bitmap: ImageBitmap;
		createBitmap: boolean = (settings.CREATE_IMAGE_BITMAP && !!window.createImageBitmap);
		preserveBitmap = false;
		_load: Promise<ImageResource>;
		_process: Promise<ImageResource>;

		url: string;
		loaded: boolean = false;

		constructor(source: HTMLImageElement, loadRightNow: boolean = true) {
			super(source);

			this.url = source.src;

			if (loadRightNow) {
				// yeah, i ignore the output
				this.load();
			}
		}

		load(createBitmap?: boolean) {
			if (createBitmap) {
				this.createBitmap = createBitmap;
			} else {
				this.createBitmap = (settings.CREATE_IMAGE_BITMAP && !!window.createImageBitmap);
			}

			if (this._load) {
				return this._load;
			}

			this._load = new Promise<any>((resolve: any) => {
				this.url = this.source.src;
				const source = this.source;

				let stuff = () => {
					this.loaded = true;
					source.onload = null;
					source.onerror = null;

					if (this.baseTexture) {
						this.baseTexture.setRealSize(source.width, source.height);
					}

					if (this.createBitmap) {
						resolve(this.process());
					}
					else {
						resolve(this);
					}
				};

				if (source.complete && source.src) {
					stuff();
				} else {
					source.onload = stuff;
				}
			});

			return this._load;
		}

		process(): Promise<any> {
			if (this._process !== null) {
				return this._process;
			}
			if (this.bitmap !== null) {
				return Promise.resolve(this.bitmap);
			}

			this._process = this.onProcess();
			return this._process;
		}

		onProcess(): Promise<any> {
			if (window.createImageBitmap) {
				return Promise.resolve(this);
			}

			return window.createImageBitmap(this.source).then((imageBitmap: ImageBitmap) => {
				this.bitmap = imageBitmap;
				this.baseTexture.update();

				return this;
			});
		}

		onTextureUpload(renderer: WebGLRenderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean {
			if (this.createBitmap) {
				if (!this.bitmap) {
					// yeah, i ignore the output.
					this.process();
					if (!this.bitmap) {
						return false;
					}
				}
				glTexture.upload(this.bitmap);
				if (!this.preserveBitmap) {
					if (this.bitmap.close) {
						this.bitmap.close()
					}
					this.bitmap = null;
					this._process = null;
				}
			} else {
				glTexture.upload(this.source);
			}

			return true;
		}

		onTextureNew(baseTexture: BaseTexture) {
			if (!this.baseTexture) {
				this.baseTexture = baseTexture;
			}

			if (this.loaded) {
				baseTexture.setRealSize(this.source.width, this.source.height);
			}
		}

		static fromSrc(src: string) {
			const elem = new Image();
			elem.src = src;
			return new ImageResource(elem);
		}
	}
}
