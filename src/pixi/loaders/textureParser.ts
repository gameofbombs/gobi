namespace gobi.loaders {
    export interface IResourceData {
        texture?: core.Texture;
    }
}

namespace gobi.pixi.loaders {
    import Resource = gobi.loaders.Resource;

    export function textureParser() {
        return function textureParser(resource: Resource, next: Function) {
            // create a new texture if the data is an Image object
            if (resource.data && resource.type === Resource.TYPE.IMAGE) {
                resource.allData.texture = Texture.fromLoader(
                    resource.data,
                    resource.url,
                    resource.name
                );
            }
            next();
        };
    }
}
