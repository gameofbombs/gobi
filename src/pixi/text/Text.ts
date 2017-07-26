namespace gobi.pixi {
	import IPoint = gobi.core.IPoint;
	import BlendMode = gobi.core.BlendMode;
	export class Text extends Container {
		gobiText: TextDisplayObject;

		constructor(text: string, style?: TextStyleOptions, canvas?: HTMLCanvasElement) {
			super();
			this.gobiText = new TextDisplayObject(this, text, style, canvas);
			this.displayObject = this.gobiText;
		}

		get texture(): Texture {
			return this.gobiText._texture;
		}

		set texture(value: Texture) // eslint-disable-line require-jsdoc
		{
			this.gobiText.texture = value;
		}

		get canvas(): HTMLCanvasElement {
			return this.gobiText.canvas;
		}

		get anchor(): IPoint {
			return this.gobiText._anchor;
		}

		set anchor(value: IPoint) {
			this.gobiText._anchor.copyFrom(value);
		}

		get blendMode(): gobi.core.BlendMode {
			return this.gobiText.blendMode;
		}

		set blendMode(value: BlendMode) {
			this.gobiText.blendMode = value;
		}

		get pluginName(): string {
			return this.gobiText.pluginName;
		}

		set pluginName(value: string) {
			this.gobiText.pluginName = value;
		}

		/**
		 * The width of the Text, setting this will actually modify the scale to achieve the value set
		 *
		 * @member {number}
		 */
		get width() {
			const elem = this.gobiText;
			elem.updateText(true);

			return Math.abs(this.transform.scale.x) * elem._texture.orig.width;
		}

		set width(value) // eslint-disable-line require-jsdoc
		{
			const elem = this.gobiText;
			elem.updateText(true);

			const scale = this.transform.scale;
			const s = utils.sign(scale.x) || 1;

			scale.x = s * value / elem._texture.orig.width;
			this._width = value;
		}

		/**
		 * The height of the Text, setting this will actually modify the scale to achieve the value set
		 *
		 * @member {number}
		 */
		get height() {
			const elem = this.gobiText;
			elem.updateText(true);

			return Math.abs(this.transform.scale.y) * elem._texture.orig.height;
		}

		set height(value) // eslint-disable-line require-jsdoc
		{
			const elem = this.gobiText;
			elem.updateText(true);

			const scale = this.transform.scale;
			const s = utils.sign(scale.y) || 1;

			scale.y = s * value / elem._texture.orig.height;
			this._height = value;
		}

		get text() {
			return this.gobiText._text;
		}

		set text(value: string) {
			this.gobiText.text = value;
		}

		get dirty() {
			return this.gobiText.dirty;
		}

		set dirty(value: boolean) {
			this.gobiText.dirty = true;
		}
	}
}
