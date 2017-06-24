namespace gobi.pixi {
	import IDisposable = gobi.core.IDisposable;
	import IPoint = gobi.core.IPoint;
	export class SpriteDisplayObject extends DisplayObject implements AnchoredDisplayObject {
		constructor(texture: Texture) {
			super();
			this.texture = texture || Texture.EMPTY;
		}

		_anchor = new PointProxyAnchor(this);

		_texture: Texture;

		_transformID = -1;
		_transformTrimmedID = -1;
		_textureID = -1;
		_textureTrimmedID = -1;

		vertexData = new Float32Array(8);
		vertexTrimmedData = new Float32Array(8);

		pluginName = 'sprite';

		blendMode = gobi.core.BlendMode.NORMAL;

		_onTextureUpdate() {
			this._textureID = -1;
			this._textureTrimmedID = -1;

			//width height
		};

		_onAnchorUpdate() {
			this._transformID = -1;
			this._transformTrimmedID = -1;
		}

		calculateVertices() {
			const transform = this.node.transform;

			if (this._transformID === transform._worldID && this._textureID === this._texture._updateID) {
				return;
			}

			this._transformID = transform._worldID;
			this._textureID = this._texture._updateID;

			// set the vertex data

			const texture = this._texture;
			const wt = transform.worldTransform;
			const a = wt.a;
			const b = wt.b;
			const c = wt.c;
			const d = wt.d;
			const tx = wt.tx;
			const ty = wt.ty;
			const vertexData = this.vertexData;
			const trim = texture.trim;
			const orig = texture.orig;
			const anchor = this._anchor;

			let w0 = 0;
			let w1 = 0;
			let h0 = 0;
			let h1 = 0;

			if (trim) {
				// if the sprite is trimmed and is not a tilingsprite then we need to add the extra
				// space before transforming the sprite coords.
				w1 = trim.x - (anchor._x * orig.width);
				w0 = w1 + trim.width;

				h1 = trim.y - (anchor._y * orig.height);
				h0 = h1 + trim.height;
			}
			else {
				w1 = -anchor._x * orig.width;
				w0 = w1 + orig.width;

				h1 = -anchor._y * orig.height;
				h0 = h1 + orig.height;
			}

			// xy
			vertexData[0] = (a * w1) + (c * h1) + tx;
			vertexData[1] = (d * h1) + (b * w1) + ty;

			// xy
			vertexData[2] = (a * w0) + (c * h1) + tx;
			vertexData[3] = (d * h1) + (b * w0) + ty;

			// xy
			vertexData[4] = (a * w0) + (c * h0) + tx;
			vertexData[5] = (d * h0) + (b * w0) + ty;

			// xy
			vertexData[6] = (a * w1) + (c * h0) + tx;
			vertexData[7] = (d * h0) + (b * w1) + ty;
		}

		renderWebGL(renderer: WebGLRenderer) {
			this.calculateVertices();

			const plugin = renderer.plugins[this.pluginName];
			renderer.batch.setObjectRenderer(plugin);
			plugin.render(this);
		}

		destroy(options?: any) {
			super.destroy(options);

			this._anchor = null;

			const destroyTexture = options && options.texture;

			if (destroyTexture) {
				const destroyBaseTexture = options && options.baseTexture;

				this._texture.destroy(!!destroyBaseTexture);
			}

			this._texture = null;
		}

		get texture(): Texture {
			return this._texture;
		}

		set texture(value: Texture) // eslint-disable-line require-jsdoc
		{
			if (this._texture === value) {
				return;
			}

			this._texture = value;

			this._textureID = -1;
			this._textureTrimmedID = -1;

			if (value) {
				//TODO: validate texture region, not the baseTexture

				// wait for the texture to load
				if (value.baseTexture.valid) {
					this._onTextureUpdate();
				}
				else {
					value.baseTexture.onValidate.addListener(() => {
						this._onTextureUpdate();
					});
				}
			}
		}

		get anchor(): IPoint {
			return this._anchor;
		}

		set anchor(value: IPoint) {
			this._anchor.copyFrom(value);
		}
	}
}
