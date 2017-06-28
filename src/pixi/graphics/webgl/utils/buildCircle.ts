namespace gobi.pixi.graphicsUtils {
	import Circle = gobi.core.Circle;
	/**
	 * Builds a circle to draw
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object to draw
	 * @param {object} webGLData - an object containing all the webGL-specific information to create this shape
	 */
	export function buildCircle(graphicsData: GraphicsData, webGLData: WebGLGraphicsData) {
		// need to convert points to a nice regular data
		const circleData = graphicsData.shape as Circle;
		const x = circleData.x;
		const y = circleData.y;
		let width;
		let height;

		// TODO - bit hacky??
		if (graphicsData.type === SHAPES.CIRC) {
			width = circleData.radius;
			height = circleData.radius;
		}
		else {
			width = circleData.width;
			height = circleData.height;
		}

		if (width === 0 || height === 0) {
			return;
		}

		const totalSegs = Math.floor(30 * Math.sqrt(circleData.radius))
			|| Math.floor(15 * Math.sqrt(circleData.width + circleData.height));

		const seg = (Math.PI * 2) / totalSegs;

		if (graphicsData.fill) {
			const color = utils.hex2rgb(graphicsData.fillColor);
			const alpha = graphicsData.fillAlpha;

			const r = color[0] * alpha;
			const g = color[1] * alpha;
			const b = color[2] * alpha;

			const verts = webGLData.points;
			const indices = webGLData.indices;

			let vecPos = verts.length / 6;

			indices.push(vecPos);

			for (let i = 0; i < totalSegs + 1; i++) {
				verts.push(x, y, r, g, b, alpha);

				verts.push(
					x + (Math.sin(seg * i) * width),
					y + (Math.cos(seg * i) * height),
					r, g, b, alpha
				);

				indices.push(vecPos++, vecPos++);
			}

			indices.push(vecPos - 1);
		}

		if (graphicsData.lineWidth) {
			const tempPoints = graphicsData.points;

			graphicsData.points = [];

			for (let i = 0; i < totalSegs + 1; i++) {
				graphicsData.points.push(
					x + (Math.sin(seg * i) * width),
					y + (Math.cos(seg * i) * height)
				);
			}

			buildLine(graphicsData, webGLData);

			graphicsData.points = tempPoints;
		}
	}
}
