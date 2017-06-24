namespace gobi.core {

	/**
	 * String of the current PIXI version.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {string}
	 */
	export const VERSION = "0.1.0";

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
		NORMAL: BlendMode.NORMAL,
		ADD: BlendMode.ADD,
		MULTIPLY: BlendMode.MULTIPLY,
		SCREEN: BlendMode.SCREEN,
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
	export enum DRAW_MODES {
		POINTS = 0,
		LINES = 1,
		LINE_LOOP = 2,
		LINE_STRIP = 3,
		TRIANGLES = 4,
		TRIANGLE_STRIP = 5,
		TRIANGLE_FAN = 6,
	}

	export enum FORMATS {
		RGBA = 6408,
		RGB = 6407,
		ALPHA = 6406,
		LUMINANCE = 6409,
		LUMINANCE_ALPHA = 6410,
		DEPTH_COMPONENT = 6402,
		DEPTH_STENCIL = 34041,
	}

	export enum TARGETS {
		TEXTURE_2D = 3553,
		TEXTURE_CUBE_MAP = 34067,
		TEXTURE_2D_ARRAY = 35866,
		TEXTURE_CUBE_MAP_POSITIVE_X = 34069,
		TEXTURE_CUBE_MAP_NEGATIVE_X = 34070,
		TEXTURE_CUBE_MAP_POSITIVE_Y = 34071,
		TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072,
		TEXTURE_CUBE_MAP_POSITIVE_Z = 34073,
		TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074,
	}

	export enum TYPES {
		UNSIGNED_BYTE = 5121,
		UNSIGNED_SHORT = 5123,
		UNSIGNED_SHORT_5_6_5 = 33635,
		UNSIGNED_SHORT_4_4_4_4 = 32819,
		UNSIGNED_SHORT_5_5_5_1 = 32820,
		FLOAT = 5126,
		HALF_FLOAT = 36193,
	}

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
	export enum SCALE_MODES {
		LINEAR = 1,
		NEAREST = 0,
	}

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
	export enum WRAP_MODES {
		CLAMP = 33071,
		REPEAT = 10497,
		MIRRORED_REPEAT = 33648,
	}

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
	export enum GC_MODES {
		AUTO = 0,
		MANUAL = 1,
	}

	/**
	 * Regexp for image type by extension.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {RegExp|string}
	 * @example `image.png`
	 */
	export const URL_FILE_EXTENSION = /\.(\w{3,4})(?:$|\?|#)/i;

	/**
	 * Regexp for data URI.
	 * Based on: https://github.com/ragingwind/data-uri-regex
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {RegExp|string}
	 * @example `data:image/png;base64`
	 */
	export const DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;(charset=[\w-]+|base64))?,(.*)/i;

	/**
	 * Regexp for SVG size.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @type {RegExp|string}
	 * @example `<svg width="100" height="100"></svg>`
	 */
	export const SVG_SIZE = /<svg[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*>/i; // eslint-disable-line max-len

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
	export enum SHAPES {
		POLY = 0,
		RECT = 1,
		CIRC = 2,
		ELIP = 3,
		RREC = 4,
	}

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
	export enum PRECISION {
		LOW = 'lowp',
		MEDIUM = 'mediump',
		HIGH = 'highp',
	}

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
	export enum TEXT_GRADIENT {
		LINEAR_VERTICAL = 0,
		LINEAR_HORIZONTAL = 1,
	}
}
