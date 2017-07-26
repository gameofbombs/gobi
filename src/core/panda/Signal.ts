class Signal< T extends Function = ()=>void> implements UniqIdMarked {
	public constructor(name:string = 'Signal') {
		this.uniqId = UniqIdGenerator.getUniq();
		this._name = name;
		this.emit = Signal.EMIT as any;
		this.dispatch = Signal.EMIT as any;
	}
	private _name:string;
	public uniqId:number;
	private _listeners:List<T>|null = null;
	
	protected createListenersList():void {
		this._listeners = new List<T>(this._name);
	}

	public addListener(listener:T, priority:number = 0):T {
		if (!this._listeners) {
			this.createListenersList();
		}
		if (this.hasListener(listener)) {
			return listener;
		}
		this._listeners.insert(listener, priority);
		return listener;
	}

	public hasListener(listener:T):boolean {
		if (!this._listeners) {
			return false;
		}
		return this._listeners.has(listener);
	}
	
	public addListenerOnce(listener:T, priority:number = 0):T {
		let fakeListener:any = (...args:Array<any>)=>{
			listener.apply(null, args);
			this.removeListener(fakeListener);
		}
		this.addListener(fakeListener as T, priority);
		return fakeListener;
	}

	public removeListener(listener:T):void {
		if (!this._listeners) {
			return;
		}
		let node = this._listeners.search(listener);
		if (!node) {
			return;
		}
		this._listeners.remove(node);
	}

	public emit:T;
	/**
	 * alias for emit
	 * @type {any}
	 */
	public dispatch:T;
	
	
	private emitOnIter(iter:ListIterator<T>, args:Array<any>):void {
		let wasError = true;
		try {
			while (!iter.getEnded()) {
				iter.getValue().apply(null, args);
				iter.next();
			}
			wasError = false;
		} finally {
			if (wasError) {
				iter.next();
				this.emitOnIter(iter, args);
			}
		}
	}
	
	public clear() {
		this._listeners = null;
	}

	private static EMIT (this:Signal<any>, ... args:Array<any>):void {
		if (!this._listeners) {
			return;
		}
		let iter = this._listeners.getHead();
		this.emitOnIter(iter, args);
		this._listeners.$returnIteratorToPool(iter);
	};
	
	public add(listener: T, priority?: number): T {
		return this.addListener(listener, priority);
	}

	public addOnce(listener: T, priority: number = 0): T {
		return this.addListenerOnce(listener, priority);
	}

}
