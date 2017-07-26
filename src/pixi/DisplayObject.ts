///ts:ref=NodeInterfaces
/// <reference path="../core/display/NodeInterfaces.ts"/> ///ts:ref:generated

namespace gobi.pixi {
	import IDisplayObject = gobi.core.IDisplayObject;
	import Node = gobi.core.Node;
	import Bounds = gobi.core.Bounds;
	import View = gobi.core.View;

	class DefaultNodeRenderer implements gobi.core.INodeRenderer {
		//TODO: use render by view, not by target
		renderWebGL(renderer: WebGLRenderer, target: Node) {
			const layer = target.layer;
			if (layer) {
				const views = layer.sortedViews;
				const len = views.length;
				for (let i = 0; i < len; i++) {
					const child = views[i].node;
					if (child.worldCullFlags === 0) {
						child.renderBehaviour.renderWebGL(renderer, child);
					}
				}
			}

			const obj = target.displayObject as DisplayObject;
			if (obj) {
				//TODO: visible and renderable
				obj.renderWebGL(renderer, target);
			}
			const children = target.children;
			const len = children.length;
			for (let i = 0; i < len; i++) {
				const child = children[i];
				if (child.worldCullFlags !== 0 ||
					child.view._activeParentLayer !== null) {
					continue;
				}
				child.renderBehaviour.renderWebGL(renderer, child);
			}
		}
	}

	export const defaultNodeRenderer = new DefaultNodeRenderer();

	export abstract class DisplayObject implements IDisplayObject {
		//TODO: move it to Node, so global visible and local visible
		destroyed = false;

		node: Container = null;

		renderWebGL(renderer: WebGLRenderer, target: Node) {

		}

		destroy(options: any) {
			this.destroyed = true;
		}

		calculateBounds(bounds: Bounds) {

		}
	}
}
