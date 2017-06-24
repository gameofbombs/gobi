namespace gobi.pixi.cache {
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

	function removeBaseTexFromCache(baseTexture: BaseTexture) {
		delete this.baseTextureCache[baseTexture._cacheId];
		const tex = this.textureCache[baseTexture._cacheId];
		if (tex) {
			if (!tex.destroyed) {
				tex.destroy();
			}
			delete this.textureCache[baseTexture._cacheId];
		}
	}

	function removeTextureFromCache(texture: Texture) {
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
