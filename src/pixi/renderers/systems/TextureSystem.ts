namespace gobi.pixi.systems {
	import GLTexture = gobi.glCore.GLTexture;

	export class TextureSystem extends BaseSystem {
		// TODO set to max textures...
		boundTextures: Array<any> = [
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
		];
		currentLocation = -1;
		CONTEXT_UID: number;

		emptyTextures: { [key: number]: GLTexture } = {};

		gl: WebGLRenderingContext;
		compressedExtensions: any;

		/**
		 * Sets up the renderer context and necessary buffers.
		 *
		 * @private
		 */
		contextChange() {
			this.removeAll(true);

			const gl = this.gl = this.renderer.gl;

			this.CONTEXT_UID = this.renderer.CONTEXT_UID;

			// TODO move this.. to a nice make empty textures class..
			this.emptyTextures = {};

			this.emptyTextures[gl.TEXTURE_2D] = GLTexture.fromData(this.gl, null, 1, 1);
			this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new GLTexture(this.gl);

			gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);

			let i;

			for (i = 0; i < 6; i++) {
				gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			}

			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			for (i = 0; i < this.boundTextures.length; i++) {
				this.bind(null, i);
			}

			let oldCompressed = this.compressedExtensions;
			this.compressedExtensions = null;

			if (oldCompressed) {
				this.initCompressed();
			}
		}

		initCompressed() {
			const gl = this.gl;
			if (!this.compressedExtensions) {
				this.compressedExtensions = {
					dxt: gl.getExtension("WEBGL_compressed_texture_s3tc"),
					pvrtc: gl.getExtension("WEBGL_compressed_texture_pvrtc"),
					atc: gl.getExtension("WEBGL_compressed_texture_atc")
				};
				this.compressedExtensions.crn = this.compressedExtensions.dxt;
			}
		}

		bind(texture: BaseTexture, location?: number) {
			const gl = this.gl;

			location = location || 0;

			if (this.currentLocation !== location) {
				this.currentLocation = location;
				gl.activeTexture(gl.TEXTURE0 + location);
			}

			if (texture) {
				texture = (texture as any).baseTexture || texture;

				if (texture.valid) {
					const glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);

					gl.bindTexture(texture.target, glTexture.texture);

					if (glTexture._updateID !== texture._updateID) {
						this.updateTexture(texture);
					}

					this.boundTextures[location] = texture;
				}
			}
			else {
				gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture);
				this.boundTextures[location] = null;
			}
		}

		unbind(texture: BaseTexture) {
			const gl = this.gl;

			for (let i = 0; i < this.boundTextures.length; i++) {
				if (this.boundTextures[i] === texture) {
					if (this.currentLocation !== i) {
						gl.activeTexture(gl.TEXTURE0 + i);
						this.currentLocation = i;
					}

					gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[texture.target].texture);
					this.boundTextures[i] = null;
				}
			}
		}

		updateTexture(texture: BaseTexture) {
			const glTexture = texture._glTextures[this.CONTEXT_UID];
			const gl = this.gl;
			// const anygl = this.gl as any;
			// let i;
			// let texturePart;

			// TODO there are only 3 textures as far as im aware?
			// Cube / 2D and later 3d. (the latter is WebGL2, we will get to that soon!)
			// if (texture.target === gl.TEXTURE_CUBE_MAP) {
			// 	// console.log( gl.UNSIGNED_BYTE)
			// 	for (i = 0; i < texture.sides.length; i++) {
			// 		// TODO - we should only upload what changed..
			// 		// but im sure this is not  going to be a problem just yet!
			// 		texturePart = texture.sides[i];
			//
			// 		if (texturePart.resource) {
			// 			if (texturePart.resource.uploadable) {
			// 				gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side,
			// 					0,
			// 					texture.format,
			// 					texture.format,
			// 					texture.type,
			// 					texturePart.resource.source);
			// 			}
			// 			else {
			// 				gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side,
			// 					0,
			// 					texture.format,
			// 					texture.width,
			// 					texture.height,
			// 					0,
			// 					texture.format,
			// 					texture.type,
			// 					texturePart.resource.source);
			// 			}
			// 		}
			// 		else {
			// 			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side,
			// 				0,
			// 				texture.format,
			// 				texture.width,
			// 				texture.height,
			// 				0,
			// 				texture.format,
			// 				texture.type,
			// 				null);
			// 		}
			// 	}
			// }
			// else if (texture.target === anygl.TEXTURE_2D_ARRAY) {
			// 	anygl.texImage3D(anygl.TEXTURE_2D_ARRAY,
			// 		0,
			// 		texture.format,
			// 		texture.width,
			// 		texture.height,
			// 		6,
			// 		0,
			// 		texture.format,
			// 		texture.type,
			// 		null);
			//
			// 	for (i = 0; i < texture.array.length; i++) {
			// 		// TODO - we should only upload what changed..
			// 		// but im sure this is not  going to be a problem just yet!
			// 		texturePart = texture.array[i];
			//
			// 		let anyRes = texturePart.resource as any;
			//
			// 		if (anyRes) {
			// 			if (anyRes.loaded > 0) {
			// 				anygl.texSubImage3D(anygl.TEXTURE_2D_ARRAY,
			// 					0,
			// 					0, // xoffset
			// 					0, // yoffset
			// 					i, // zoffset
			// 					anyRes.width,
			// 					anyRes.height,
			// 					1,
			// 					texture.format,
			// 					texture.type,
			// 					anyRes.source);
			// 			}
			// 		}
			// 	}
			// } else

			glTexture.premultiplyAlpha = texture.premultiplyAlpha;
			if (!texture.resource ||
				!texture.resource.onTextureUpload(this.renderer, texture, glTexture)) {
				glTexture.uploadData(null, texture.realWidth, texture.realHeight);
			}

			// lets only update what changes..
			if (texture.forceUploadStyle) {
				this.setStyle(texture);
			}
			glTexture._updateID = texture._updateID;
		}


		managedTextures: { [key: number]: BaseTexture } = [];

		initTexture(texture: BaseTexture) {
			const glTexture = new GLTexture(this.gl, -1, -1, texture.format, texture.type);

			glTexture.premultiplyAlpha = texture.premultiplyAlpha;
			// guarentee an update..
			glTexture._updateID = -1;

			texture._glTextures[this.CONTEXT_UID] = glTexture;

			this.managedTextures[texture.uniqId] = texture;
			texture.onDispose.addListener(this.destroyTexture);

			return glTexture;
		}

		/**
		 * Deletes the texture from WebGL
		 *
		 * @param {PIXI.BaseTexture|PIXI.Texture} texture - the texture to destroy
		 */
		destroyTexture = (texture: BaseTexture, contextLost: boolean = false) => {
			texture = (texture as any).baseTexture || texture;
			delete this.managedTextures[texture.uniqId];

			if (texture._glTextures[this.renderer.CONTEXT_UID]) {
				if (!contextLost) {
					this.unbind(texture);
					texture._glTextures[this.renderer.CONTEXT_UID].destroy();
				}
				texture.onDispose.removeListener(this.destroyTexture);

				delete texture._glTextures[this.renderer.CONTEXT_UID];
			}
		};

		setStyle(texture: BaseTexture) {
			const gl = this.gl;

			gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, texture.wrapMode);
			gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, texture.wrapMode);

			if (texture.mipmap) {
				/* eslint-disable max-len */
				gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
				/* eslint-disable max-len */
			}
			else {
				gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
			}

			gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
		}

		//TODO: this is needed for context loss
		removeAll(contextLost: boolean = false) {
			for (let i = 0; i < this.boundTextures.length; i++) {
				this.boundTextures[i] = null;
			}
			let all = Object.keys(this.managedTextures);
			for (let key of all) {
				this.destroyTexture(this.managedTextures[key as any], contextLost);
			}
		}
	}
}
