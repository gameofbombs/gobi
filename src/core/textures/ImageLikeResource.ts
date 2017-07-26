namespace gobi.core {
	import GLTexture = gobi.glCore.GLTexture;

	export interface IDimensions {
		width: number;
		height: number;
	}

	export class ImageLikeResource<SourceType extends ITextureSource> implements ITextureResource, IDisposable {
		constructor(source: SourceType) {
			this.source = source;
		}

		source: SourceType;
		baseTexture: BaseTexture = null;

		onTextureNew(baseTexture: BaseTexture) {
			if (!this.baseTexture) {
				this.baseTexture = baseTexture;
			}
			baseTexture.setRealSize(this.source.width, this.source.height);
		}

		onTextureUpload(renderer: pixi.WebGLRenderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean {
			glTexture.upload(this.source as any);

			return true;
		}

		destroyed = false;

		destroy(options?: any) {
			this.source = null;
			this.baseTexture = null;
			this.destroyed = true;
		}

		onTextureDestroy(baseTexture: BaseTexture) {
			if (this.baseTexture === baseTexture && !this.destroyed) {
				this.destroy();
			}
			return true;
		}

		get width(): number {
			return this.source.width;
		}

		get height(): number  {
			return this.source.height;
		}
	}
}
