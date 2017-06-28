namespace gobi.pixi.graphicsUtils {
	import RoundedRectangle = gobi.core.RoundedRectangle;
	/**
	 * Builds a rounded rectangle to draw
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
	 * @param {object} webGLData - an object containing all the webGL-specific information to create this shape
	 */
	export function buildRoundedRectangle(graphicsData: GraphicsData, webGLData: WebGLGraphicsData) {
		const rrectData = graphicsData.shape as RoundedRectangle;
		const x = rrectData.x;
		const y = rrectData.y;
		const width = rrectData.width;
		const height = rrectData.height;

		const radius = rrectData.radius;

		const recPoints = [];

		recPoints.push(x, y + radius);
		quadraticBezierCurve(x, y + height - radius, x, y + height, x + radius, y + height, recPoints);
		quadraticBezierCurve(x + width - radius, y + height, x + width, y + height, x + width, y + height - radius, recPoints);
		quadraticBezierCurve(x + width, y + radius, x + width, y, x + width - radius, y, recPoints);
		quadraticBezierCurve(x + radius, y, x, y, x, y + radius + 0.0000000001, recPoints);

		// this tiny number deals with the issue that occurs when points overlap and earcut fails to triangulate the item.
		// TODO - fix this properly, this is not very elegant.. but it works for now.

		let i, j: number;

		if (graphicsData.fill) {
			const color = utils.hex2rgb(graphicsData.fillColor);
			const alpha = graphicsData.fillAlpha;

			const r = color[0] * alpha;
			const g = color[1] * alpha;
			const b = color[2] * alpha;

			const verts = webGLData.points;
			const indices = webGLData.indices;

			const vecPos = verts.length / 6;

			const triangles = utils.earcut.earcut(recPoints, null, 2);

			for (i = 0, j = triangles.length; i < j; i += 3) {
				indices.push(triangles[i] + vecPos);
				indices.push(triangles[i] + vecPos);
				indices.push(triangles[i + 1] + vecPos);
				indices.push(triangles[i + 2] + vecPos);
				indices.push(triangles[i + 2] + vecPos);
			}

			for (i = 0, j = recPoints.length; i < j; i++) {
				verts.push(recPoints[i], recPoints[++i], r, g, b, alpha);
			}
		}

		if (graphicsData.lineWidth) {
			const tempPoints = graphicsData.points;

			graphicsData.points = recPoints;

			buildLine(graphicsData, webGLData);

			graphicsData.points = tempPoints;
		}
	}

	/**
	 * Calculate a single point for a quadratic bezier curve.
	 * Utility function used by quadraticBezierCurve.
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {number} n1 - first number
	 * @param {number} n2 - second number
	 * @param {number} perc - percentage
	 * @return {number} the result
	 *
	 */
	function getPt(n1: number, n2: number, perc: number) {
		const diff = n2 - n1;

		return n1 + (diff * perc);
	}

	/**
	 * Calculate the points for a quadratic bezier curve. (helper function..)
	 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {number} fromX - Origin point x
	 * @param {number} fromY - Origin point x
	 * @param {number} cpX - Control point x
	 * @param {number} cpY - Control point y
	 * @param {number} toX - Destination point x
	 * @param {number} toY - Destination point y
	 * @param {number[]} [out=[]] - The output array to add points into. If not passed, a new array is created.
	 * @return {number[]} an array of points
	 */
	function quadraticBezierCurve(fromX: number, fromY: number, cpX: number, cpY: number, toX: number, toY: number, out: Array<number> = []) {
		const n = 20;
		const points = out;

		let xa = 0;
		let ya = 0;
		let xb = 0;
		let yb = 0;
		let x = 0;
		let y = 0;

		for (let i = 0, j = 0; i <= n; ++i) {
			j = i / n;

			// The Green Line
			xa = getPt(fromX, cpX, j);
			ya = getPt(fromY, cpY, j);
			xb = getPt(cpX, toX, j);
			yb = getPt(cpY, toY, j);

			// The Black Dot
			x = getPt(xa, xb, j);
			y = getPt(ya, yb, j);

			points.push(x, y);
		}

		return points;
	}
}