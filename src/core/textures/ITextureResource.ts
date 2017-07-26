namespace gobi.core {
	import GLTexture = gobi.glCore.GLTexture;

	export interface ITextureResource {
		onTextureUpload(renderer: pixi.WebGLRenderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean;

		onTextureTag?(baseTexture: BaseTexture): void;

		onTextureNew?(baseTexture: BaseTexture): void;

		onTextureDestroy?(baseTexture: BaseTexture): boolean;
	}
}
