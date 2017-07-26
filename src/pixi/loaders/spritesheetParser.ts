namespace gobi.loaders {
	export interface IResourceData {
		spritesheet?: gobi.pixi.Spritesheet;
		textures?: { [key: string]: gobi.core.Texture };
	}

	export interface IResourceMetadata {
		imageMetadata?: IResourceData;
	}
}

namespace gobi.pixi.loaders {

	import Resource = gobi.loaders.Resource;

	export function spritesheetParser() {
		return function spritesheetParser(resource: Resource, next: Function) {
			const imageResourceName = `${resource.name}_image`;

			// skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
			if (!resource.data
				|| resource.type !== Resource.TYPE.JSON
				|| !resource.data.frames
				|| this.resources[imageResourceName]
			) {
				next();

				return;
			}

			const loadOptions = {
				crossOrigin: resource.crossOrigin,
				loadType: Resource.LOAD_TYPE.IMAGE,
				metadata: resource.metadata.imageMetadata,
				parentResource: resource,
			};

			const resourcePath = getResourcePath(resource, this.baseUrl);

			// load the image for this sheet
			this.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res: Resource) {
				const spritesheet = new Spritesheet(
					res.allData.texture.baseTexture,
					resource.data,
					resource.url
				);

				spritesheet.parse(() => {
					resource.allData.spritesheet = spritesheet;
					resource.allData.textures = spritesheet.textures;
					next();
				});
			});
		};
	}

	export function getResourcePath(resource: Resource, baseUrl: string) {
		// Prepend url path unless the resource image is a data url
		if (resource.isDataUrl) {
			return resource.data.meta.image;
		}

		return url.resolve(resource.url.replace(baseUrl, ''), resource.data.meta.image);
	}
}
