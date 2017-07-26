// import maxRecommendedTextures from './utils/maxRecommendedTextures';
// import canUploadSameBuffer from './utils/canUploadSameBuffer';

namespace gobi.settings {
	/**
	 * If set to true WebGL will attempt make textures mimpaped by default.
	 * Mipmapping will only succeed if the base texture uploaded has power of two dimensions.
	 *
	 * @static
	 * @memberof PIXI.settings
	 * @type {boolean}
	 * @default true
	 */
	export let MIPMAP_TEXTURES = true;

	/**
	 * Default resolution / device pixel ratio of the renderer.
	 *
	 * @static
	 * @memberof PIXI.settings
	 * @type {number}
	 * @default 1
	 */
	export let RESOLUTION = 1;

	export let CREATE_IMAGE_BITMAP = false;

	/**
	 * Default wrap modes that are supported by pixi.
	 *
	 * @static
	 * @memberof PIXI.settings
	 * @type {number}
	 * @default PIXI.WRAP_MODES.CLAMP
	 */
	export let WRAP_MODE = gobi.core.WRAP_MODES.CLAMP;

	/**
	 * The scale modes that are supported by pixi.
	 *
	 * @static
	 * @memberof PIXI.settings
	 * @type {number}
	 * @default PIXI.SCALE_MODES.LINEAR
	 */
	export let SCALE_MODE = gobi.core.SCALE_MODES.LINEAR;
}
