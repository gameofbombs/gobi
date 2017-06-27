// disabling eslint for now, going to rewrite this in v5
/* eslint-disable */

namespace gobi.pixi {

	//TODO: fix "FILL" problem, number|Array<number> , getColor, getSingleColor

	export interface TextStyleOptions {
		align?: string;
		breakWords?: boolean;
		dropShadow?: boolean;
		dropShadowAlpha?: number;
		dropShadowAngle?: number;
		dropShadowBlur?: number;
		dropShadowColor?: string | number;
		dropShadowDistance?: number;
		multiShadow?: Array<SingleShadow>;
		fill?: string | Array<string> | CanvasGradient | CanvasPattern;
		fillGradientType?: number;
		fillGradientStops?: Array<number>;
		fontFamily?: string | Array<string>;
		fontSize?: number | string;
		fontStyle?: string;
		fontVariant?: string;
		fontWeight?: string;
		letterSpacing?: number;
		lineHeight?: number;
		lineJoin?: string;
		miterLimit?: number;
		padding?: number;
		stroke?: string | number;
		strokeThickness?: number;
		textBaseline?: string;
		trim?: boolean;
		wordWrap?: boolean;
		wordWrapWidth?: number;
	}

	export interface SingleShadow {
		x: number, y: number;
		alpha: number;
	}

	const defaultStyle: TextStyleOptions = {
		align: 'left',
		breakWords: false,
		dropShadow: false,
		dropShadowAlpha: 1,
		dropShadowAngle: Math.PI / 6,
		dropShadowBlur: 0,
		dropShadowColor: 'black',
		dropShadowDistance: 5,
		fill: 'black',
		fillGradientType: TEXT_GRADIENT.LINEAR_VERTICAL,
		fillGradientStops: [],
		fontFamily: 'Arial',
		fontSize: 26,
		fontStyle: 'normal',
		fontVariant: 'normal',
		fontWeight: 'normal',
		letterSpacing: 0,
		lineHeight: 0,
		lineJoin: 'miter',
		miterLimit: 10,
		padding: 0,
		stroke: 'black',
		strokeThickness: 0,
		textBaseline: 'alphabetic',
		trim: false,
		wordWrap: false,
		wordWrapWidth: 100,
	};

	/**
	 * A TextStyle Object decorates a Text Object. It can be shared between
	 * multiple Text objects. Changing the style will update all text objects using it.
	 *
	 * @class
	 * @memberof PIXI
	 */
	export class TextStyle implements TextStyleOptions {
		_align: string;
		_breakWords: boolean;
		_dropShadow: boolean;
		_dropShadowAlpha: number;
		_dropShadowAngle: number;
		_dropShadowBlur: number;
		_dropShadowColor: string | number;
		_dropShadowDistance: number;
		_multiShadow?: Array<SingleShadow>;
		_fill: string | Array<string> | CanvasGradient | CanvasPattern;
		_fillGradientType: number;
		_fillGradientStops: Array<number>;
		_fontFamily: string | Array<string>;
		_fontSize: number | string;
		_fontStyle: string;
		_fontVariant: string;
		_fontWeight: string;
		_letterSpacing: number;
		_lineHeight: number;
		_lineJoin: string;
		_miterLimit: number;
		_padding: number;
		_stroke: string | number;
		_strokeThickness: number;
		_textBaseline: string;
		_trim: boolean;
		_wordWrap: boolean;
		_wordWrapWidth: number;

		//version number
		styleID: number;

		/**
		 * @param {object} [style] - The style parameters
		 * @param {string} [style.align='left'] - Alignment for multiline text ('left', 'center' or 'right'),
		 *  does not affect single line text
		 * @param {boolean} [style.breakWords=false] - Indicates if lines can be wrapped within words, it
		 *  needs wordWrap to be set to true
		 * @param {boolean} [style.dropShadow=false] - Set a drop shadow for the text
		 * @param {number} [style.dropShadowAlpha=1] - Set alpha for the drop shadow
		 * @param {number} [style.dropShadowAngle=Math.PI/6] - Set a angle of the drop shadow
		 * @param {number} [style.dropShadowBlur=0] - Set a shadow blur radius
		 * @param {string} [style.dropShadowColor='black'] - A fill style to be used on the dropshadow e.g 'red', '#00FF00'
		 * @param {number} [style.dropShadowDistance=5] - Set a distance of the drop shadow
		 * @param {string|Array<string>|number|Array<number>|CanvasGradient|CanvasPattern} [style.fill='black'] - A canvas
		 *  fillstyle that will be used on the text e.g 'red', '#00FF00'. Can be an array to create a gradient
		 *  eg ['#000000','#FFFFFF']
		 * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
		 * @param {number} [style.fillGradientType=PIXI.TEXT_GRADIENT.LINEAR_VERTICAL] - If fill is an array of colours
		 *  to create a gradient, this can change the type/direction of the gradient. See {@link PIXI.TEXT_GRADIENT}
		 * @param {Array<number>} [style.fillGradientStops] - If fill is an array of colours to create a gradient, this array can set
		 * the stop points (numbers between 0 and 1) for the color, overriding the default behaviour of evenly spacing them.
		 * @param {string|Array<string>} [style.fontFamily='Arial'] - The font family
		 * @param {number|string} [style.fontSize=26] - The font size (as a number it converts to px, but as a string,
		 *  equivalents are '26px','20pt','160%' or '1.6em')
		 * @param {string} [style.fontStyle='normal'] - The font style ('normal', 'italic' or 'oblique')
		 * @param {string} [style.fontVariant='normal'] - The font variant ('normal' or 'small-caps')
		 * @param {string} [style.fontWeight='normal'] - The font weight ('normal', 'bold', 'bolder', 'lighter' and '100',
		 *  '200', '300', '400', '500', '600', '700', 800' or '900')
		 * @param {number} [style.letterSpacing=0] - The amount of spacing between letters, default is 0
		 * @param {number} [style.lineHeight] - The line height, a number that represents the vertical space that a letter uses
		 * @param {string} [style.lineJoin='miter'] - The lineJoin property sets the type of corner created, it can resolve
		 *      spiked text issues. Default is 'miter' (creates a sharp corner).
		 * @param {number} [style.miterLimit=10] - The miter limit to use when using the 'miter' lineJoin mode. This can reduce
		 *      or increase the spikiness of rendered text.
		 * @param {number} [style.padding=0] - Occasionally some fonts are cropped. Adding some padding will prevent this from
		 *     happening by adding padding to all sides of the text.
		 * @param {string|number} [style.stroke='black'] - A canvas fillstyle that will be used on the text stroke
		 *  e.g 'blue', '#FCFF00'
		 * @param {number} [style.strokeThickness=0] - A number that represents the thickness of the stroke.
		 *  Default is 0 (no stroke)
		 * @param {boolean} [style.trim=false] - Trim transparent borders
		 * @param {string} [style.textBaseline='alphabetic'] - The baseline of the text that is rendered.
		 * @param {boolean} [style.wordWrap=false] - Indicates if word wrap should be used
		 * @param {number} [style.wordWrapWidth=100] - The width at which text will wrap, it needs wordWrap to be set to true
		 */
		constructor(style: TextStyleOptions) {
			this.styleID = 0;

			(Object as any).assign(this, defaultStyle, style);
		}

		/**
		 * Creates a new TextStyle object with the same values as this one.
		 * Note that the only the properties of the object are cloned.
		 *
		 * @return {PIXI.TextStyle} New cloned TextStyle object
		 */
		clone() {
			const clonedProperties: any = {};
			const anyStyle = defaultStyle;
			const anyThis = this as any;

			for (const key in anyStyle) {
				clonedProperties[key] = anyThis[key];
			}

			return new TextStyle(clonedProperties);
		}

		/**
		 * Resets all properties to the defaults specified in TextStyle.prototype._default
		 */
		reset() {
			(Object as any).assign(this, defaultStyle);
		}

		get align() {
			return this._align;
		}

		set align(align) {
			if (this._align !== align) {
				this._align = align;
				this.styleID++;
			}
		}

		get breakWords() {
			return this._breakWords;
		}

		set breakWords(breakWords) {
			if (this._breakWords !== breakWords) {
				this._breakWords = breakWords;
				this.styleID++;
			}
		}

		get dropShadow() {
			return this._dropShadow;
		}

		set dropShadow(dropShadow) {
			if (this._dropShadow !== dropShadow) {
				this._dropShadow = dropShadow;
				this.styleID++;
			}
		}

		get multiShadow() {
			return this._multiShadow;
		}

		set multiShadow(value) {
			if (this._multiShadow !== value) {
				this._multiShadow = value;
				this.styleID++;
			}
		}

		get dropShadowAlpha() {
			return this._dropShadowAlpha;
		}

		set dropShadowAlpha(dropShadowAlpha) {
			if (this._dropShadowAlpha !== dropShadowAlpha) {
				this._dropShadowAlpha = dropShadowAlpha;
				this.styleID++;
			}
		}

		get dropShadowAngle() {
			return this._dropShadowAngle;
		}

		set dropShadowAngle(dropShadowAngle) {
			if (this._dropShadowAngle !== dropShadowAngle) {
				this._dropShadowAngle = dropShadowAngle;
				this.styleID++;
			}
		}

		get dropShadowBlur() {
			return this._dropShadowBlur;
		}

		set dropShadowBlur(dropShadowBlur) {
			if (this._dropShadowBlur !== dropShadowBlur) {
				this._dropShadowBlur = dropShadowBlur;
				this.styleID++;
			}
		}

		get dropShadowColor() {
			return this._dropShadowColor;
		}

		set dropShadowColor(dropShadowColor) {
			const outputColor = getColor(dropShadowColor);
			if (this._dropShadowColor !== outputColor) {
				this._dropShadowColor = outputColor;
				this.styleID++;
			}
		}

		get dropShadowDistance() {
			return this._dropShadowDistance;
		}

		set dropShadowDistance(dropShadowDistance) {
			if (this._dropShadowDistance !== dropShadowDistance) {
				this._dropShadowDistance = dropShadowDistance;
				this.styleID++;
			}
		}

		get fill() {
			return this._fill;
		}

		set fill(fill) {
			const outputColor = getColor(fill as any);
			if (this._fill !== outputColor) {
				this._fill = outputColor;
				this.styleID++;
			}
		}

		get fillGradientType() {
			return this._fillGradientType;
		}

		set fillGradientType(fillGradientType) {
			if (this._fillGradientType !== fillGradientType) {
				this._fillGradientType = fillGradientType;
				this.styleID++;
			}
		}

		get fillGradientStops() {
			return this._fillGradientStops;
		}

		set fillGradientStops(fillGradientStops) {
			if (!areArraysEqual(this._fillGradientStops, fillGradientStops)) {
				this._fillGradientStops = fillGradientStops;
				this.styleID++;
			}
		}

		get fontFamily() {
			return this._fontFamily;
		}

		set fontFamily(fontFamily) {
			if (this.fontFamily !== fontFamily) {
				this._fontFamily = fontFamily;
				this.styleID++;
			}
		}

		get fontSize() {
			return this._fontSize;
		}

		set fontSize(fontSize) {
			if (this._fontSize !== fontSize) {
				this._fontSize = fontSize;
				this.styleID++;
			}
		}

		get fontStyle() {
			return this._fontStyle;
		}

		set fontStyle(fontStyle) {
			if (this._fontStyle !== fontStyle) {
				this._fontStyle = fontStyle;
				this.styleID++;
			}
		}

		get fontVariant() {
			return this._fontVariant;
		}

		set fontVariant(fontVariant) {
			if (this._fontVariant !== fontVariant) {
				this._fontVariant = fontVariant;
				this.styleID++;
			}
		}

		get fontWeight() {
			return this._fontWeight;
		}

		set fontWeight(fontWeight) {
			if (this._fontWeight !== fontWeight) {
				this._fontWeight = fontWeight;
				this.styleID++;
			}
		}

		get letterSpacing() {
			return this._letterSpacing;
		}

		set letterSpacing(letterSpacing) {
			if (this._letterSpacing !== letterSpacing) {
				this._letterSpacing = letterSpacing;
				this.styleID++;
			}
		}

		get lineHeight() {
			return this._lineHeight;
		}

		set lineHeight(lineHeight) {
			if (this._lineHeight !== lineHeight) {
				this._lineHeight = lineHeight;
				this.styleID++;
			}
		}

		get lineJoin() {
			return this._lineJoin;
		}

		set lineJoin(lineJoin) {
			if (this._lineJoin !== lineJoin) {
				this._lineJoin = lineJoin;
				this.styleID++;
			}
		}

		get miterLimit() {
			return this._miterLimit;
		}

		set miterLimit(miterLimit) {
			if (this._miterLimit !== miterLimit) {
				this._miterLimit = miterLimit;
				this.styleID++;
			}
		}

		get padding() {
			return this._padding;
		}

		set padding(padding) {
			if (this._padding !== padding) {
				this._padding = padding;
				this.styleID++;
			}
		}

		get stroke() {
			return this._stroke;
		}

		set stroke(stroke) {
			const outputColor = getColor(stroke);
			if (this._stroke !== outputColor) {
				this._stroke = outputColor;
				this.styleID++;
			}
		}

		get strokeThickness() {
			return this._strokeThickness;
		}

		set strokeThickness(strokeThickness) {
			if (this._strokeThickness !== strokeThickness) {
				this._strokeThickness = strokeThickness;
				this.styleID++;
			}
		}

		get textBaseline() {
			return this._textBaseline;
		}

		set textBaseline(textBaseline) {
			if (this._textBaseline !== textBaseline) {
				this._textBaseline = textBaseline;
				this.styleID++;
			}
		}

		get trim() {
			return this._trim;
		}

		set trim(trim) {
			if (this._trim !== trim) {
				this._trim = trim;
				this.styleID++;
			}
		}

		get wordWrap() {
			return this._wordWrap;
		}

		set wordWrap(wordWrap) {
			if (this._wordWrap !== wordWrap) {
				this._wordWrap = wordWrap;
				this.styleID++;
			}
		}

		get wordWrapWidth() {
			return this._wordWrapWidth;
		}

		set wordWrapWidth(wordWrapWidth) {
			if (this._wordWrapWidth !== wordWrapWidth) {
				this._wordWrapWidth = wordWrapWidth;
				this.styleID++;
			}
		}

		addShadow(x: number, y: number, alpha: number) {
			this._multiShadow = this._multiShadow || [];
			this._multiShadow.push({x: x, y: y, alpha: alpha || 0.0})
			this.styleID++;
		}

		/**
		 * Generates a font style string to use for `TextMetrics.measureFont()`.
		 *
		 * @return {string} Font style string, for passing to `TextMetrics.measureFont()`
		 */
		toFontString() {
			// build canvas api font setting from individual components. Convert a numeric this.fontSize to px
			const fontSizeString = (typeof this.fontSize === 'number') ? `${this.fontSize}px` : this.fontSize;

			// Clean-up fontFamily property by quoting each font name
			// this will support font names with spaces
			let fontFamilies: Array<string> = this.fontFamily as Array<string>;

			if (!Array.isArray(this.fontFamily)) {
				fontFamilies = (this.fontFamily as string).split(',');
			}

			for (let i = fontFamilies.length - 1; i >= 0; i--) {
				// Trim any extra white-space
				let fontFamily = fontFamilies[i].trim();

				// Check if font already contains strings
				if (!(/([\"\'])[^\'\"]+\1/).test(fontFamily)) {
					fontFamily = `"${fontFamily}"`;
				}
				fontFamilies[i] = fontFamily;
			}

			return `${this.fontStyle} ${this.fontVariant} ${this.fontWeight} ${fontSizeString} ${fontFamilies.join(',')}`;
		}
	}

	/**
	 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
	 *
	 * @param {number|Array<number>} color
	 * @return {string} The color as a string.
	 */
	function getSingleColor(color: number | string): string {
		let anyColor = color as any;
		if (typeof color === 'number') {
			return utils.hex2string(anyColor);
		}
		else if (typeof color === 'string') {
			if (anyColor.indexOf('0x') === 0) {
				anyColor = anyColor.replace('0x', '#');
			}
		}

		return anyColor;
	}

	/**
	 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
	 * This version can also convert array of colors
	 *
	 * @param {number|Array<number>} color
	 * @return {string} The color as a string.
	 */
	function getColor(color: number | string | Array<number> | Array<string>): string {
		const anyColor = color as any;
		if (!Array.isArray(color)) {
			return getSingleColor(color);
		}
		else {
			for (let i = 0; i < color.length; ++i) {
				anyColor[i] = getSingleColor(color[i]);
			}

			return anyColor;
		}
	}

	/**
	 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
	 * This version can also convert array of colors
	 *
	 * @param {Array} array1 First array to compare
	 * @param {Array} array2 Second array to compare
	 * @return {boolean} Do the arrays contain the same values in the same order
	 */
	function areArraysEqual(array1: Array<any>, array2: Array<any>) {
		if (!Array.isArray(array1) || !Array.isArray(array2)) {
			return false;
		}

		if (array1.length !== array2.length) {
			return false;
		}

		for (let i = 0; i < array1.length; ++i) {
			if (array1[i] !== array2[i]) {
				return false;
			}
		}

		return true;
	}
}
