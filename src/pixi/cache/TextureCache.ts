namespace gobi.pixi.cache {
	import ImageResource = gobi.core.ImageResource;
	export const baseTextureCache: { [key: string]: BaseTexture } = {};
	export const textureCache: { [key: string]: Texture } = {};

	export function newBaseTextureFromImg(src: string): BaseTexture {
		const cachedValue = baseTextureCache[src];
		if (cachedValue) {
			return cachedValue;
		}

		const baseTex = new BaseTexture(ImageResource.fromSrc(src));
		baseTex._cacheId = src;
		baseTextureCache[src] = baseTex;
		baseTex.onDispose.addListener(removeBaseTexFromCache);
		return baseTex;
	}

	export function addBaseTextureToCache(baseTexture: BaseTexture, cacheId: string): boolean {
		const cachedValue = baseTextureCache[cacheId];
		if (cachedValue && cachedValue !== baseTexture) {
			// console.warn(`BaseTexture added to the cache with an id [${id}] that already had an entry`);
			// return cachedValue;
			return false;
		}

		baseTexture._cacheId = cacheId;
		baseTexture._cacheId = cacheId;
		baseTextureCache[cacheId] = baseTexture;
		baseTexture.onDispose.addListener(removeBaseTexFromCache);
		return true;
	}

	export function addTextureToCache(texture: Texture, cacheId: string): boolean {
		const cachedValue = textureCache[cacheId];
		if (cachedValue && cachedValue !== texture) {
			// console.warn(`BaseTexture added to the cache with an id [${id}] that already had an entry`);
			// return cachedValue;
			return false;
		}

		textureCache[cacheId] = texture;
		return true;
	}

	export function removeBaseTexFromCache(baseTexture: BaseTexture) {
		delete this.baseTextureCache[baseTexture._cacheId];
		const tex = this.textureCache[baseTexture._cacheId];
		if (tex) {
			if (!tex.destroyed) {
				tex.destroy();
			}
			delete this.textureCache[baseTexture._cacheId];
		}
	}

	export function removeTextureFromCache(texture: Texture) {
		const cacheId = texture.baseTexture._cacheId;
		if (!cacheId) return;

		delete this.textureCache[cacheId];
	}

	export function newTextureFromImg(src: string): Texture {
		const cachedValue = textureCache[src];
		if (cachedValue) {
			return cachedValue;
		}

		const tex = new Texture(newBaseTextureFromImg(src));
		textureCache[src] = tex;
		//TODO: texture needs onDispose too ?
		return tex;
	}
}
