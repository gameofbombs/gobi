namespace gobi.pixi {
	import ImageResource = gobi.core.ImageResource;
	import getResolutionOfUrl = gobi.utils.getResolutionOfUrl;
	export class BaseTexture extends gobi.core.BaseTexture {
		static fromImage(src: string) {
			return gobi.pixi.cache.newBaseTextureFromImg(src);
		}

		static addToCache(texture: BaseTexture, id: string) {
			if (id) {
				return gobi.pixi.cache.addBaseTextureToCache(texture, id);
			}
			return false;
		}
	}

	export class Texture extends gobi.core.Texture {
		static fromImage(src: string) {
			return gobi.pixi.cache.newTextureFromImg(src);
		}


		/**
		 * Create a texture from a source and add to the cache.
		 *
		 * @static
		 * @param {HTMLImageElement|HTMLCanvasElement} source - The input source.
		 * @param {String} imageUrl - File name of texture, for cache and resolving resolution.
		 * @param {String} [name] - Human readible name for the texture cache. If no name is
		 *        specified, only `imageUrl` will be used as the cache ID.
		 * @return {PIXI.Texture} Output texture
		 */
		static fromLoader(source: HTMLImageElement, imageUrl: string, name: string) {
			// console.log('added from loader...')
			const resource = new ImageResource(source, false);// .from(imageUrl, crossorigin);// document.createElement('img');

			resource.url = imageUrl;

			//  console.log('base resource ' + resource.width);
			const baseTexture = new BaseTexture(resource);
			baseTexture.resolution = getResolutionOfUrl(imageUrl);
			resource.load();

			const texture = new Texture(baseTexture);

			// No name, use imageUrl instead
			if (!name) {
				name = imageUrl;
			}

			// lets also add the frame to pixi's global cache for fromFrame and fromImage fucntions
			BaseTexture.addToCache(texture.baseTexture, name);
			Texture.addToCache(texture, name);

			// also add references by url if they are different.
			if (name !== imageUrl) {
				BaseTexture.addToCache(texture.baseTexture, imageUrl);
				Texture.addToCache(texture, imageUrl);
			}

			return texture;
		}

		/**
		 * Adds a Texture to the global TextureCache. This cache is shared across the whole PIXI object.
		 *
		 * @static
		 * @param {PIXI.Texture} texture - The Texture to add to the cache.
		 * @param {string} id - The id that the Texture will be stored against.
		 */
		static addToCache(texture: Texture, id: string) {
			if (id) {
				return gobi.pixi.cache.addTextureToCache(texture, id);
			}
			return false;
		}
	}
}
