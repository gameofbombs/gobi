///ts:ref=textureParser
/// <reference path="./textureParser.ts"/> ///ts:ref:generated
///ts:ref=spritesheetParser
/// <reference path="./spritesheetParser.ts"/> ///ts:ref:generated

namespace gobi.pixi.loaders {
	export class Resource extends gobi.loaders.Resource implements gobi.loaders.IResourceData {
		constructor(name: string, url: string, options?: gobi.loaders.IResourceOptions) {
			super(name, url, options)
		}

		get texture() {
			return this.allData.texture;
		}

		get textures() {
			return this.allData.textures;
		}

		get spritesheet() {
			return this.allData.spritesheet;
		}

		get spineData(): any {
			return (this.allData as any).spineData;
		}

		set spineData(value) {
			(this.allData as any).spineData = value;
		}

		get spineAtlas(): any {
			return (this.allData as any).spineAtlas;
		}

		set spineAtlas(value) {
			(this.allData as any).spineAtlas = value;
		}
	}

// Add custom extentions
	/**
	 *
	 * The new loader, extends Resource Loader by Chad Engler: https://github.com/englercj/resource-loader
	 *
	 * ```js
	 * const loader = PIXI.loader; // pixi exposes a premade instance for you to use.
	 * //or
	 * const loader = new PIXI.loaders.Loader(); // you can also create your own if you want
	 *
	 * const sprites = {};
	 *
	 * // Chainable `add` to enqueue a resource
	 * loader.add('bunny', 'data/bunny.png')
	 *       .add('spaceship', 'assets/spritesheet.json');
	 * loader.add('scoreFont', 'assets/score.fnt');
	 *
	 * // Chainable `pre` to add a middleware that runs for each resource, *before* loading that resource.
	 * // This is useful to implement custom caching modules (using filesystem, indexeddb, memory, etc).
	 * loader.pre(cachingMiddleware);
	 *
	 * // Chainable `use` to add a middleware that runs for each resource, *after* loading that resource.
	 * // This is useful to implement custom parsing modules (like spritesheet parsers, spine parser, etc).
	 * loader.use(parsingMiddleware);
	 *
	 * // The `load` method loads the queue of resources, and calls the passed in callback called once all
	 * // resources have loaded.
	 * loader.load((loader, resources) => {
 *     // resources is an object where the key is the name of the resource loaded and the value is the resource object.
 *     // They have a couple default properties:
 *     // - `url`: The URL that the resource was loaded from
 *     // - `error`: The error that happened when trying to load (if any)
 *     // - `data`: The raw data that was loaded
 *     // also may contain other properties based on the middleware that runs.
 *     sprites.bunny = new PIXI.TilingSprite(resources.bunny.texture);
 *     sprites.spaceship = new PIXI.TilingSprite(resources.spaceship.texture);
 *     sprites.scoreFont = new PIXI.TilingSprite(resources.scoreFont.texture);
 * });
	 *
	 * // throughout the process multiple signals can be dispatched.
	 * loader.onProgress.add(() => {}); // called once per loaded/errored file
	 * loader.onError.add(() => {}); // called once per errored file
	 * loader.onLoad.add(() => {}); // called once per loaded file
	 * loader.onComplete.add(() => {}); // called once when the queued resources all load.
	 * ```
	 *
	 * @see https://github.com/englercj/resource-loader
	 *
	 * @class
	 * @extends module:resource-loader.ResourceLoader
	 * @memberof PIXI.loaders
	 */
	export class Loader extends gobi.loaders.Loader {
		ResourceClass = Resource;

		/**
		 * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
		 * @param {number} [concurrency=10] - The number of resources to load concurrently.
		 */
		constructor(baseUrl?: string, concurrency?: number) {
			super(baseUrl, concurrency);

			// compressed images
			this.pre(compressedImageParser());

			for (let i = 0; i < Loader._pixiMiddleware.length; ++i) {
				this.use(Loader._pixiMiddleware[i]());
			}
		}

		static _pixiMiddleware: Array<() => (res: gobi.loaders.Resource, next: Function) => void> = [
			// parse any blob into more usable objects (e.g. Image)
			gobi.loaders.blobMiddlewareFactory,
			// parse any Image objects into textures
			textureParser,
			// parse any spritesheet data into multiple textures
			spritesheetParser,
			// parse bitmap font data into multiple textures
			// bitmapFontParser,
		];

		/**
		 * Adds a default middleware to the pixi loader.
		 *
		 * @static
		 * @param {Function} fn - The middleware to add.
		 */
		static addPixiMiddleware(fn: () => (res: gobi.loaders.Resource, next: Function) => void) {
			Loader._pixiMiddleware.push(fn);
		}

		/**
		 * Destroy the loader, removes references.
		 */
		destroy() {
			this.reset();
		}
	}

	Resource.setExtensionXhrType('fnt', Resource.XHR_RESPONSE_TYPE.DOCUMENT);
}


namespace gobi.pixi {
	export let loader = new loaders.Loader();
}