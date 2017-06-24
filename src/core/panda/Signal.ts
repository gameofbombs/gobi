///ts:ref=List
/// <reference path="./List.ts"/> ///ts:ref:generated
///ts:ref=UniqIdGenerator
/// <reference path="./UniqIdGenerator.ts"/> ///ts:ref:generated
///ts:ref=UniqIdMarked
/// <reference path="./UniqIdMarked.ts"/> ///ts:ref:generated
class Signal< T extends Function> implements UniqIdMarked {
	public constructor() {
		this.uniqId = UniqIdGenerator.getUniq();
		//this._listeners = new List<T>('Signal_' + this.uniqId);
		this._listeners = new List<T>('Signal');
	}

	public uniqId:number;
	private _listeners:List<T> = null;

	public addListener(listener:T, priority:number = 0):T {
		if (this.hasListener(listener)) {
			return listener;
		}
		this._listeners.insert(listener, priority);
		return listener;
	}

	public hasListener(listener:T):boolean {
		return this._listeners.has(listener);
	}

	public removeListener(listener:T):void {
		let node = this._listeners.search(listener);
		if (!node) {
			return;
		}
		this._listeners.remove(node);
	}

	public emit:T = <any>function Signal_emit (... args:Array<any>):void {
		let node:ListIterator<T> = this._listeners.getHead();
		while (!node.getEnded()) {
			node.getValue().apply(null, args);
			node.next();
		}
	}
}

		