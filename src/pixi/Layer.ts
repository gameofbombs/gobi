///ts:ref=Container
/// <reference path="./Container.ts"/> ///ts:ref:generated
namespace gobi.pixi.display {
	export const Group = gobi.core.Group;

	export class Layer extends Container {
		constructor(group?: gobi.core.Group) {
			super();
			this.layer = new gobi.core.Layer(this, group);
		}
	}
}
