namespace gobi.pixi {
	import IDisposable = gobi.core.IDisposable;
	import IPoint = gobi.core.IPoint;
	import Bounds = gobi.core.Bounds;

	const tempPoint = new core.Point();

	export class SpriteDisplayObject extends DisplayObject implements AnchoredDisplayObject {
		constructor(node: Container, texture?: Texture) {
			super();
			this.node = node;
			this.texture = texture || Texture.EMPTY;
		}

		_anchor = new PointProxyAnchor(this);

		_texture: Texture;

		_transformID = -1;
		_transformTrimmedID = -1;
		_textureID = -1;
		_textureTrimmedID = -1;

		vertexData = new Float32Array(8);
		vertexTrimmedData : Float32Array = null;

		pluginName = 'sprite';

		blendMode = gobi.core.BlendMode.NORMAL;

		_onTextureUpdate() {
			this._textureID = -1;
			this._textureTrimmedID = -1;

			let node = this.node;
			if (node._width)
			{
				node.scale.x = utils.sign(node.scale.x) * node._width / this._texture.orig.width;
			}

			if (node._height)
			{
				node.scale.y = utils.sign(node.scale.y) * node._height / this._texture.orig.height;
			}
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

		calculateTrimmedVertices()
		{
			const transform = this.node.transform;
			if (!this.vertexTrimmedData)
			{
				this.vertexTrimmedData = new Float32Array(8);
			}
			else if (this._transformTrimmedID === transform._worldID && this._textureTrimmedID === this._texture._updateID)
			{
				return;
			}

			this._transformTrimmedID = transform._worldID;
			this._textureTrimmedID = this._texture._updateID;

			// lets do some special trim code!
			const texture = this._texture;
			const vertexData = this.vertexTrimmedData;
			const orig = texture.orig;
			const anchor = this._anchor;

			// lets calculate the new untrimmed bounds..
			const wt = transform.worldTransform;
			const a = wt.a;
			const b = wt.b;
			const c = wt.c;
			const d = wt.d;
			const tx = wt.tx;
			const ty = wt.ty;

			const w1 = -anchor._x * orig.width;
			const w0 = w1 + orig.width;

			const h1 = -anchor._y * orig.height;
			const h0 = h1 + orig.height;

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

		calculateBounds(bounds: Bounds)
		{
			const trim = this._texture.trim;
			const orig = this._texture.orig;

			// First lets check to see if the current texture has a trim..
			if (!trim || (trim.width === orig.width && trim.height === orig.height))
			{
				// no trim! lets use the usual calculations..
				this.calculateVertices();
				bounds.addQuad(this.vertexData);
			}
			else
			{
				// lets calculate a special trimmed bounds...
				this.calculateTrimmedVertices();
				bounds.addQuad(this.vertexTrimmedData);
			}
		}

		containsPoint(point: IPoint)
		{
			this.node.transform.worldTransform.applyInverse(point, tempPoint);

			const width = this._texture.orig.width;
			const height = this._texture.orig.height;
			const x1 = -width * this.anchor.x;
			let y1 = 0;

			if (tempPoint.x > x1 && tempPoint.x < x1 + width)
			{
				y1 = -height * this.anchor.y;

				if (tempPoint.y > y1 && tempPoint.y < y1 + height)
				{
					return true;
				}
			}

			return false;
		}
	}
}
