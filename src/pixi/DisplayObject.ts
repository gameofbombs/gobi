///ts:ref=NodeInterfaces
/// <reference path="../core/display/NodeInterfaces.ts"/> ///ts:ref:generated

namespace gobi.pixi {
	import IDisplayObject = gobi.core.IDisplayObject;
	import Node = gobi.core.Node;

	class DefaultNodeRenderer implements gobi.core.INodeRenderer {
		renderWebGL(renderer: WebGLRenderer, target: Node) {
			const obj = target.displayObject as DisplayObject;
			if (obj) {
				//TODO: visible and renderable
				if (!obj.visible || !obj.renderable)
					return;
				obj.renderWebGL(renderer, target);
			}
			const children = target.children;
			const len = children.length;
			for (let i = 0; i < len; i++) {
				const child = children[i];
				child.renderBehaviour.renderWebGL(renderer, child);
			}
		}
	}

	export const defaultNodeRenderer = new DefaultNodeRenderer();

	export abstract class DisplayObject implements IDisplayObject {
		//TODO: move it to Node, so global visible and local visible
		visible = true;
		renderable = true;
		destroyed = false;

		node: Container = null;

		renderWebGL(renderer: WebGLRenderer, target: Node) {

		}

		destroy(options: any) {
			this.destroyed = true;
		}
	}
}
