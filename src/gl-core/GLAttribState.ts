namespace gobi.glCore {
	export class GLAttribState {
		tempAttribState: Array<Number> = null;
		attribState: Array<Number> = null;

		constructor(maxAttribs: number) {
			this.tempAttribState = new Array<Number>(maxAttribs);
			this.attribState = new Array<Number>(maxAttribs);
		}
	}
}
