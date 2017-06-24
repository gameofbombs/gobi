namespace gobi.core {
	let UID = 0;

// let math = require('../../../math');
	/**
	 * @class
	 * @memberof PIXI
	 * @extends PIXI.UniformGroup
	 */
	export class UniformGroupCast<T> {
		uniforms: T = {} as any;
		syncUniforms: { [key: string]: object } = {};
		dirtyId: number = 0;
		_static: boolean = false;
		id: number;
		group = true;

		/**
		 * @param uniforms - Custom uniforms to use to augment the built-in ones.
		 * @param [_static=false] - some flag, I suppose
		 */
		constructor(uniforms: { [key: string]: object }, _static?: boolean) {
			this.uniforms = uniforms as any;
			// lets generate this when the shader ?
			this.id = UID++;

			this._static = !!_static;
		}

		update() {
			this.dirtyId++;
		}

		add(name: string, uniforms: { [key: string]: object }, _static?: boolean) {
			(this.uniforms as any)[name] = new UniformGroup(uniforms, _static);
		}

		static from(uniforms: { [key: string]: object }, _static?: boolean) {
			return new UniformGroup(uniforms, _static);
		}
	}

	export class UniformGroup extends UniformGroupCast<{ [key: string]: any }> {

	}
}
