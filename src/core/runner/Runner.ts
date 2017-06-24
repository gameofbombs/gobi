namespace gobi.core.runner {
	export class MiniRunner {
		items: Array<object> = [];
		private _name: string;
		run: Function = null;

		get name() {
			return this._name;
		}

		constructor(name: string, argsLength?: number) {
			this._name = name;
			this.run = MiniRunner.generateRun(name, argsLength || 0);
		}

		add(item: any) {
			if (!item[this._name]) return;
			this.remove(item);
			this.items.push(item);
		}

		remove(item: any) {
			const index = this.items.indexOf(item);
			if (index !== -1) {
				this.items.splice(index, 1)
			}
		}

		contains(item: any) {
			return this.items.indexOf(item) !== -1
		}

		removeAll() {
			this.items.length = 0;
		}

		static hash: { [key: string]: Function } = {};

		static generateRun(name: string, argsLength: number) {
			const key = name + "|" + argsLength;
			let func = MiniRunner.hash[key];
			if (!func) {
				if (argsLength > 0) {
					var args = "arg0";
					for (let i = 1; i < argsLength; i++) {
						args += ",arg" + i
					}
					func = new Function(args, "var items = this.items; for(var i=0;i<items.length;i++){ items[i]." + name + "(" + args + "); }")
				} else {
					func = new Function("var items = this.items; for(var i=0;i<items.length;i++){ items[i]." + name + "(); }")
				}
				MiniRunner.hash[key] = func
			}
			return func;
		}
	}

	export function create0(name: string): Runner0 {
		return new MiniRunner(name, 0) as Runner0;
	}

	export function create1<T>(name: string): Runner1<T> {
		return new MiniRunner(name, 1) as Runner1<T>;
	}

	export function create2<T, U>(name: string): Runner2<T, U> {
		return new MiniRunner(name, 2) as Runner2<T, U>;
	}

	export function create3<T, U, V>(name: string): Runner3<T, U, V> {
		return new MiniRunner(name, 3) as Runner3<T, U, V>;
	}

	export interface Runner0 extends MiniRunner {
		run(): void
	}

	export interface Runner1<T> extends MiniRunner {
		run(arg: T): void
	}

	export interface Runner2<T, U> extends MiniRunner {
		run(arg1: T, arg2: U): void
	}

	export interface Runner3<T, U, V> extends MiniRunner {
		run(arg1: T, arg2: U, agr3: V): void
	}
}
