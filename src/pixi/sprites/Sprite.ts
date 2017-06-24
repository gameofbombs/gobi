namespace gobi.pixi {
	import IDisposable = gobi.core.IDisposable;
	import IPoint = gobi.core.IPoint;
	import BlendMode = gobi.core.BlendMode;

	export class Sprite extends Container {
		gobiSprite: SpriteDisplayObject;

		constructor(texture: Texture) {
			super();
			this.gobiSprite = new SpriteDisplayObject(texture);
			this.gobiSprite.node = this;
			this.displayObject = this.gobiSprite;
		}

		get texture(): Texture {
			return this.gobiSprite._texture;
		}

		set texture(value: Texture) // eslint-disable-line require-jsdoc
		{
			this.gobiSprite.texture = value;
		}

		get anchor(): IPoint {
			return this.gobiSprite._anchor;
		}

		set anchor(value: IPoint) {
			this.gobiSprite._anchor.copyFrom(value);
		}

		get blendMode(): gobi.core.BlendMode {
			return this.gobiSprite.blendMode;
		}

		set blendMode(value: BlendMode) {
			this.gobiSprite.blendMode = value;
		}

		get pluginName(): string {
			return this.gobiSprite.pluginName;
		}

		set pluginName(value: string) {
			this.gobiSprite.pluginName = value;
		}

		static fromImage(src: string) {
			return new Sprite(gobi.pixi.cache.newTextureFromImg(src));
		}
	}
}
