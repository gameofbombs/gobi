namespace gobi.loaders {
	export interface IResourceData {
		compressedImage?: compressed.CompressedImage
	}

	Resource.setExtensionXhrType('dds', Resource.XHR_RESPONSE_TYPE.BUFFER);
	Resource.setExtensionXhrType('crn', Resource.XHR_RESPONSE_TYPE.BUFFER);
	Resource.setExtensionXhrType('pvr', Resource.XHR_RESPONSE_TYPE.BUFFER);
	Resource.setExtensionXhrType('etc1', Resource.XHR_RESPONSE_TYPE.BUFFER)
}

namespace gobi.pixi.loaders {
	import Resource = gobi.loaders.Resource;

	export function compressedImageParser() {
		return function compressedParser(resource: Resource, next: Function) {
			if (resource.url.indexOf('.crn') != -1 || resource.url.indexOf('.dds') != -1 || resource.url.indexOf('.pvr') != -1 || resource.url.indexOf('.etc1') != -1) {
				let compressedImage = resource.allData.compressedImage || new compressed.CompressedImage(resource.url);
				if (resource.data) {
					throw "compressedImageParser middleware must be specified in loader.before() and must have zero resource.data";
				}
				resource.allData.compressedImage = compressedImage;
				resource.onComplete.addListener(function () {
					compressedImage.loadFromArrayBuffer(resource.data, resource.url.indexOf(".crn") > 0);
					resource.allData.texture = new Texture(new BaseTexture(compressedImage));
					resource.data = null;
				});
			}
			next();
		};
	}
}
