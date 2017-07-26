namespace gobi.interaction {
	export interface IRenderer {
		readonly view: HTMLCanvasElement;
		_lastObjectRendered: core.Node;
		resolution: number;
	}
}
