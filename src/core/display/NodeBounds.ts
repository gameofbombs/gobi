namespace gobi.core {
	const tempQueue: Array<Node> = [];

	export class NodeBounds {
		node: Node;

		constructor(node: Node) {
			this.node = node;
		}

		tempBounds = new Bounds();
		tempRect = new Rectangle();
		lastCtxUpdateID = -1;

		//TODO: pass the transform, calc local bounds too
		calculateBounds(bounds: Bounds) {
			//TODO: remove recursive

			const queue = tempQueue;
			queue.length = 0;
			queue.push(this.node);

			for (let qcur = 0; qcur < queue.length; qcur++) {
				const elem = queue[qcur];
				if (elem.displayObject) {
					elem.displayObject.calculateBounds(bounds);
				}
				const children = elem.children;
				for (let i = 0; i < children.length; ++i) {
					queue.push(children[i]);
				}
			}
			queue.length = 0;
		}

		getBounds(tempRect?: Rectangle): Rectangle {
			this.calculateBounds(this.tempBounds);
			return this.tempBounds.getRectangle(tempRect || this.tempRect);
		}

		getLocalBounds(tempRect?: Rectangle): Rectangle {
			this.calculateBounds(this.tempBounds);

			const rect = this.tempBounds.getRectangle(tempRect || this.tempRect);
			//if its not rotated
			if (rect !== Rectangle.EMPTY) {
				const wt = this.node.transform.worldTransform;

				rect.width /= Math.abs(wt.a);
				rect.height /= Math.abs(wt.d);
			}
			return rect;
		}
	}
}
