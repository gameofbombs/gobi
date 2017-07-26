namespace gobi.pixi {

	/**
	 * String of the current PIXI version.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {string}
	 */
	export const VERSION = "5.0.0";

	/**
	 * Two Pi.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {number}
	 */
	export const PI_2 = Math.PI * 2;

	/**
	 * Conversion factor for converting radians to degrees.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {number}
	 */
	export const RAD_TO_DEG = 180 / Math.PI;

	/**
	 * Conversion factor for converting degrees to radians.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {number}
	 */
	export const DEG_TO_RAD = Math.PI / 180;

	export const DEG_PI = 180;

	/**
	 * Constant to identify the Renderer Type.
	 *
	 * @property {number} UNKNOWN - Unknown render type.
	 * @property {number} WEBGL - WebGL render type.
	 * @property {number} CANVAS - Canvas render type.
	 */
	export enum RENDERER_TYPE {
		UNKNOWN = 0,
		WEBGL = 1,
		CANVAS = 2,
	}

	/**
	 * Various blend modes supported by webgl
	 *
	 * TODO: move to pixi constants
	 *
	 * @property NORMAL
	 * @property ADD
	 * @property MULTIPLY
	 * @property SCREEN
	 */
	export const BLEND_MODES = {
		NORMAL: gobi.core.BlendMode.NORMAL,
		ADD: gobi.core.BlendMode.ADD,
		MULTIPLY: gobi.core.BlendMode.MULTIPLY,
		SCREEN: gobi.core.BlendMode.SCREEN,
	};

	/**
	 * Various webgl draw modes. These can be used to specify which GL drawMode to use
	 * under certain situations and renderers.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {object}
	 * @property {number} POINTS
	 * @property {number} LINES
	 * @property {number} LINE_LOOP
	 * @property {number} LINE_STRIP
	 * @property {number} TRIANGLES
	 * @property {number} TRIANGLE_STRIP
	 * @property {number} TRIANGLE_FAN
	 */
	export const DRAW_MODES = gobi.core.DRAW_MODES;

	export const FORMATS = gobi.core.FORMATS;

	export const TYPES = gobi.core.TYPES;

	export const TARGETS = gobi.core.TARGETS;

	/**
	 * The scale modes that are supported by pixi.
	 *
	 * The PIXI.settings.SCALE_MODE scale mode affects the default scaling mode of future operations.
	 * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {object}
	 * @property {number} LINEAR Smooth scaling
	 * @property {number} NEAREST Pixelating scaling
	 */
	export const SCALE_MODES = gobi.core.SCALE_MODES;

	/**
	 * The wrap modes that are supported by pixi.
	 *
	 * The PIXI.settings.WRAP_MODE wrap mode affects the default wraping mode of future operations.
	 * It can be re-assigned to either CLAMP or REPEAT, depending upon suitability.
	 * If the texture is non power of two then clamp will be used regardless as webGL can
	 * only use REPEAT if the texture is po2.
	 *
	 * This property only affects WebGL.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {object}
	 * @property {number} CLAMP - The textures uvs are clamped
	 * @property {number} REPEAT - The texture uvs tile and repeat
	 * @property {number} MIRRORED_REPEAT - The texture uvs tile and repeat with mirroring
	 */
	export const WRAP_MODES = gobi.core.WRAP_MODES;

	/**
	 * The gc modes that are supported by pixi.
	 *
	 * The PIXI.settings.GC_MODE Garbage Collection mode for pixi textures is AUTO
	 * If set to GC_MODE, the renderer will occasianally check textures usage. If they are not
	 * used for a specified period of time they will be removed from the GPU. They will of course
	 * be uploaded again when they are required. This is a silent behind the scenes process that
	 * should ensure that the GPU does not  get filled up.
	 *
	 * Handy for mobile devices!
	 * This property only affects WebGL.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {object}
	 * @property {number} AUTO - Garbage collection will happen periodically automatically
	 * @property {number} MANUAL - Garbage collection will need to be called manually
	 */
	export const GC_MODES = gobi.core.GC_MODES;

	/**
	 * Constants that identify shapes, mainly to prevent `instanceof` calls.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {object}
	 * @property {number} POLY
	 * @property {number} RECT
	 * @property {number} CIRC
	 * @property {number} ELIP
	 * @property {number} RREC
	 */
	export const SHAPES = gobi.core.SHAPES;

	/**
	 * Constants that specify float precision in shaders.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {object}
	 * @property {string} LOW='lowp'
	 * @property {string} MEDIUM='mediump'
	 * @property {string} HIGH='highp'
	 */
	export const PRECISION = gobi.core.PRECISION;

	/**
	 * Constants that define the type of gradient on text.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {object}
	 * @property {number} LINEAR_VERTICAL
	 * @property {number} LINEAR_HORIZONTAL
	 */
	export const TEXT_GRADIENT = gobi.core.TEXT_GRADIENT;

	export const URL_FILE_EXTENSION = gobi.core.URL_FILE_EXTENSION;

	export const DATA_URI = gobi.core.DATA_URI;

	export const SVG_SIZE = gobi.core.SVG_SIZE;

	export const UPDATE_PRIORITY = gobi.core.UPDATE_PRIORITY;
}
