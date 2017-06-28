namespace gobi.pixi {
	import IDisposable = gobi.core.IDisposable;
	import IPoint = gobi.core.IPoint;
	import BlendMode = gobi.core.BlendMode;

	export class Graphics extends Container implements IGraphics {
		gg: GraphicsDisplayObject;

		constructor(texture: Texture) {
			super();
			this.gg = new GraphicsDisplayObject();
			this.gg.node = this;
			this.displayObject = this.gg;
		}

		get    blendMode(): gobi.core.BlendMode {
			return this.gg.blendMode;
		}

		set    blendMode(value: BlendMode) {
			this.gg.blendMode = value;
		}

		//Graphics interface

		lineStyle(lineWidth = 0, color = 0, alpha = 1) {
			this.gg.lineStyle(lineWidth, color, alpha);
			return this;
		}

		moveTo(x: number, y: number) {
			this.gg.moveTo(x, y);
			return this;
		}

		lineTo(x: number, y: number) {
			this.gg.lineTo(x, y);
			return this;
		}

		quadraticCurveTo(cpX: number, cpY: number, toX: number, toY: number) {
			this.gg.quadraticCurveTo(cpX, cpY, toX, toY);
			return this;
		}

		bezierCurveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number) {
			this.gg.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);
			return this;
		}

		arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
			this.gg.arcTo(x1, y1, x2, y2, radius);
			return this;
		}

		arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, anticlockwise = false) {
			this.gg.arc(cx, cy, radius, startAngle, endAngle, anticlockwise);
			return this;
		}

		beginFill(color = 0, alpha = 1) {
			this.gg.beginFill(color, alpha);
			return this;
		}

		endFill() {
			this.gg.endFill();
			return this;
		}

		drawRect(x: number, y: number, width: number, height: number) {
			this.gg.drawRect(x, y, width, height);
			return this;
		}

		drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
			this.gg.drawRoundedRect(x, y, width, height, radius);

			return this;
		}

		drawCircle(x: number, y: number, radius: number) {
			this.gg.drawCircle(x, y, radius);
			return this;
		}

		drawEllipse(x: number, y: number, width: number, height: number) {
			this.gg.drawEllipse(x, y, width, height);
			return this;
		}

		drawPolygon(path: Array<IPoint | number> | core.Polygon) {
			this.gg.drawPolygon(path);
			return this;
		}

		clear() {
			this.gg.clear();
			return this;
		}
	}
}
