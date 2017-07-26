namespace gobi.pixi {
	import IDisposable = gobi.core.IDisposable;
	import IPoint = gobi.core.IPoint;
	import BlendMode = gobi.core.BlendMode;

	export class Sprite extends Container {
		gobiSprite: SpriteDisplayObject;

		constructor(texture: Texture) {
			super();
			this.gobiSprite = new SpriteDisplayObject(this, texture);
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
			if (typeof value === 'number')
				this.gobiSprite.blendMode = BlendMode.values[value as number];
			else
				this.gobiSprite.blendMode = value;
		}

		get pluginName(): string {
			return this.gobiSprite.pluginName;
		}

		set pluginName(value: string) {
			this.gobiSprite.pluginName = value;
		}

		get width()
		{
			return Math.abs(this.scale.x) * this.gobiSprite._texture.orig.width;
		}

		set width(value) // eslint-disable-line require-jsdoc
		{
			const s = utils.sign(this.scale.x) || 1;

			this.scale.x = s * value / this.gobiSprite._texture.orig.width;
			this._width = value;
		}

		get height()
		{
			return Math.abs(this.scale.y) * this.gobiSprite._texture.orig.height;
		}

		set height(value)
		{
			const s = utils.sign(this.scale.y) || 1;

			this.scale.y = s * value / this.gobiSprite._texture.orig.height;
			this._height = value;
		}

		static fromImage(src: string) {
			return new Sprite(gobi.pixi.cache.newTextureFromImg(src));
		}
	}
}
