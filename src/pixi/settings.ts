// import maxRecommendedTextures from './utils/maxRecommendedTextures';
// import canUploadSameBuffer from './utils/canUploadSameBuffer';

namespace gobi.pixi {
	export class settings {
		static get PREFER_WEBGL_2() { return gobi.settings.PREFER_WEBGL_2 };
		static set PREFER_WEBGL_2(value) { gobi.settings.PREFER_WEBGL_2 = value };

		/**
		 * Target frames per millisecond.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default 0.06
		 */
		static TARGET_FPMS = 0.06;

		/**
		 * If set to true WebGL will attempt make textures mimpaped by default.
		 * Mipmapping will only succeed if the base texture uploaded has power of two dimensions.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {boolean}
		 * @default true
		 */
		static get MIPMAP_TEXTURES() { return gobi.settings.MIPMAP_TEXTURES };
		static set MIPMAP_TEXTURES(value) { gobi.settings.MIPMAP_TEXTURES = value };

		/**
		 * Default resolution / device pixel ratio of the renderer.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default 1
		 */
		static get RESOLUTION() { return gobi.settings.RESOLUTION };
		static set RESOLUTION(value) { gobi.settings.RESOLUTION = value };

		/**
		 * Default filter resolution.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default 1
		 */
		static FILTER_RESOLUTION = 1;

		/**
		 * The maximum textures that this device supports.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default 32
		 */
		// export let SPRITE_MAX_TEXTURES = maxRecommendedTextures(32);

		// TODO: maybe change to SPRITE.BATCH_SIZE: 2000
		// TODO: maybe add PARTICLE.BATCH_SIZE: 15000

		/**
		 * The default sprite batch size.
		 *
		 * The default aims to balance desktop and mobile devices.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default 4096
		 */
		static SPRITE_BATCH_SIZE = 4096;

		/**
		 * The prefix that denotes a URL is for a retina asset.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {RegExp|string}
		 * @example `@2x`
		 * @default /@(.+)x/
		 */
		static RETINA_PREFIX = /@(.+)x/;

		/**
		 * The default render options if none are supplied to {@link PIXI.WebGLRenderer}
		 * or {@link PIXI.CanvasRenderer}.
		 *
		 * @static
		 * @constant
		 * @memberof PIXI.settings
		 * @type {object}
		 * @property {HTMLCanvasElement} view=null
		 * @property {number} resolution=1
		 * @property {boolean} antialias=false
		 * @property {boolean} forceFXAA=false
		 * @property {boolean} autoResize=false
		 * @property {boolean} transparent=false
		 * @property {number} backgroundColor=0x000000
		 * @property {boolean} clearBeforeRender=true
		 * @property {boolean} preserveDrawingBuffer=false
		 * @property {boolean} roundPixels=false
		 */
		static RENDER_OPTIONS: IRendererOptions = {
			view: null,
			antialias: false,
			forceFXAA: false,
			autoResize: false,
			transparent: false,
			backgroundColor: 0x000000,
			clearBeforeRender: true,
			preserveDrawingBuffer: false,
			roundPixels: false,
			width: 800,
			height: 600
		};

		/**
		 * Default transform type.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default PIXI.TRANSFORM_MODE.STATIC
		 */
		static TRANSFORM_MODE = 0;

		/**
		 * Default Garbage Collection mode.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default PIXI.GC_MODES.AUTO
		 */
		static GC_MODE = 0;

		/**
		 * Default Garbage Collection max idle.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default 3600
		 */
		static GC_MAX_IDLE = 60 * 60;

		/**
		 * Default Garbage Collection maximum check count.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default 600
		 */
		static GC_MAX_CHECK_COUNT = 60 * 10;

		/**
		 * Default wrap modes that are supported by pixi.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default PIXI.WRAP_MODES.CLAMP
		 */
		static get WRAP_MODE() { return gobi.settings.WRAP_MODE };
		static set WRAP_MODE(value) { gobi.settings.WRAP_MODE = value };

		/**
		 * The scale modes that are supported by pixi.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {number}
		 * @default PIXI.SCALE_MODES.LINEAR
		 */
		static get SCALE_MODE() { return gobi.settings.SCALE_MODE };
		static set SCALE_MODE(value) { gobi.settings.SCALE_MODE = value };

		/**
		 * Default specify float precision in shaders.
		 *
		 * @static
		 * @memberof PIXI.settings
		 * @type {string}
		 * @default PIXI.PRECISION.MEDIUM
		 */
		static PRECISION_VERTEX = gobi.core.PRECISION.HIGH;

		static PRECISION_FRAGMENT = gobi.core.PRECISION.MEDIUM;

		//TODO: mobile device test
		static SPRITE_MAX_TEXTURES = 32;

		static CAN_UPLOAD_SAME_BUFFER = true;

		/**
		 * Can we upload the same buffer in a single frame?
		 *
		 * @static
		 * @constant
		 * @memberof PIXI
		 * @type {boolean}
		 */
		// export let CAN_UPLOAD_SAME_BUFFER = canUploadSameBuffer();
	}
}
