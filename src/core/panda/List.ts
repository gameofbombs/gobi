class List<T> {
	public constructor(name:string) {
		this.$name = name;
	}

	private _head:ListNode<T> = null;
	private _tail:ListNode<T> = null;
	public $name:string = null;

	public getHead(): ListIterator<T> {
		let head = this.findValidHead();
		return this.getIteratorForNode(head);
	}

	public getTail(): ListIterator<T> {
		let tail = this.findValidTail();
		return this.getIteratorForNode(tail);
	}

	public getIsEmpty():boolean {
		return this._length === 0;
	}

	private _length:number = 0;
	public getLength():number {
		return this._length;
	}

	/**
	* Destroys iterator after removing by default
	*/
	public remove(iterator:ListIterator<T>, destroyIterator:boolean = true):void {
		iterator.$removeElement(destroyIterator);
		this._length--;
	}

	/**
	* You MUST destroy iterator after accessing node, otherwise removed item will be zombie forever
	*/
	public search(searchable:T):ListIterator<T> {
		let iterator = this.getTail();
		while (!iterator.getEnded()) {
			if (iterator.getValue() === searchable) {
				return iterator;
			}
			iterator.prev();
		}
		return null;
	}

	public has(searchable:T):boolean {
		let iterator = this.getTail();
		while (!iterator.getEnded()) {
			if (iterator.getValue() === searchable) {
				iterator.destroy();
				return true;
			}
			iterator.prev();
		}
		return false;
	}

	public insert(insertable:T, priority:number = 0) {
		let node = this._tail;
		let insertableNode = new ListNode(this, insertable, priority);

		while (node && node.priority < priority) {
			node = node.prev;
		}
		if (!node) {
			this.addBefore(insertableNode, this._head)
		} else {
			this.addAfter(insertableNode, node);
		}
		this._length++;
	}

	private findValidHead():ListNode<T> {
		let head = this._head;
		while (head && !head.getIsValid()) {
			head = head.next;
		}
		return head;
	}

	private findValidTail():ListNode<T> {
		let tail = this._tail;
		while (tail && !tail.getIsValid()) {
			tail = tail.prev;
		}
		return tail;
	}

	private getIteratorForNode<T>(node:ListNode<T>) {
		return new ListIterator<T>(node, this.$name);
	}

	private addAfter(insertableNode:ListNode<T>, node:ListNode<T>= null):void {
		if (!node) {
			if (this._tail) {
				node = this._tail;
			} else {
				this._head = insertableNode;
				this._tail = insertableNode;
				insertableNode.next = null;
				insertableNode.prev = null;
			}
		}
		if (node) {
			let tail = node.next;

			node.next = insertableNode;
			insertableNode.prev = node;

			insertableNode.next = tail;
			if (tail) {
				tail.prev = insertableNode
			} else {
				this._tail = insertableNode;
			}
		}
	}

	private addBefore(insertableNode:ListNode<T>, node:ListNode<T>= null):void {
		if (!node) {
			if (this._head) {
				node = this._head;
			} else {
				this._head = insertableNode;
				this._tail = insertableNode;
				insertableNode.next = null;
				insertableNode.prev = null;
			}
		}
		if (node) {
			let head = node.prev;

			node.prev = insertableNode;
			insertableNode.next = node;

			insertableNode.prev = head;
			if (head) {
				head.next = insertableNode
			} else {
				this._head = insertableNode;
			}
		}
	}

	public $removeNode(node:ListNode<T>):void {
		let prev = node.prev;
		if (prev) {
			prev.next = node.next;
		} else {
			this._head = node.next;
		}
		let next = node.next;
		if (next) {
			next.prev = node.prev;
		} else {
			this._tail = node.prev;
		}
		node.next = null;
		node.prev = null;
	}
}

class ListNode<T> {
	public constructor(list: List<T>, value:T = null, priority:number, next:ListNode<T> = null, prev:ListNode<T> = null) {
		this._list = list;
		this.value = value;
		this.priority = priority;
		this.next = next;
		this.prev = prev;
		this._isValid = true;
		this._listName = list.$name;
	}

	public value:T;
	public priority:number;
	public next:ListNode<T>;
	public prev:ListNode<T>;
	private _listName:string;

	private _isValid:boolean;
	public getIsValid():boolean {
		return this._isValid;
	}

	public _refCounter:number = 0;
	public getRefCounter():number {
		return this._refCounter;
	}
	public setRefCounter(value:number) {
		this._refCounter = value;
		if (this._refCounter === 0 && this._isValid === false) {
			this._list.$removeNode(this);
		}
	}

	public incRefcounter():void {
		this.setRefCounter(this._refCounter + 1);
	}

	public decRefcounter():void {
		this.setRefCounter(this._refCounter - 1);
	}

	public _list:List<T>;

	public invalidate():void {
		this._isValid = false;
		this.value = null;
	}
}

class ListIterator<T> {
	public constructor(node:ListNode<T>, listName:string) {
		this._listName = listName;
		this.setNode(node);
	}

	public copyFrom(iter: ListIterator<T>):void {
		this._listName = iter._listName;
		this.setNode(iter.getNode());
	}

	public clone():ListIterator<T> {
		return new ListIterator(this.getNode(), this._listName);
	}

	private _listName:string;

	private $_node:ListNode<T>;
	private getNode():ListNode<T> {
		return this.$_node;
	}
	private setNode(node:ListNode<T>) {
		if (this.$_node === node) {
			return;
		}
		if (this.$_node) {
			this.$_node.decRefcounter();
		}
		this.$_node = node;
		if (this.$_node) {
			if (!this.$_node.getIsValid()) {
			}
			this.$_node.incRefcounter();
		}
	}

	public getEnded():boolean {
		return this.getNode() === null;
	}

	public getIsValid():boolean {
		return this.getNode() !== null;
	}

	public getValue():T {
		let node = this.getNode();
		if (!node) {
			return null;
		}
		if (!node.getIsValid()) {
			return null;
		}
		return node.value;
	}

	public getPriority():number {
		let node = this.getNode();
		if (!node) {
			return NaN;
		}
		if (!node.getIsValid()) {
			return NaN;
		}
		return node.priority;
	}

	public $removeElement(destroyIterator:boolean):void {
		if (this.getEnded()) {
			return;
		}
		this.getNode().invalidate();
		if (destroyIterator) {
			this.destroy();
		}
	}

	public next():ListIterator<T> {
		let node = this.getNode();
		if (!node) {
			return null;
		}
		while (true) {
			if (node.next) {
				node = node.next;
				if (node.getIsValid()) {
					this.setNode(node);
					break;
				} else {
					continue;
				}
			} else {
				this.setNode(null);
				break;
			}
		}
		return this;
	}

	public prev():ListIterator<T> {
		let node = this.getNode();
		if (!node) {
			return null;
		}
		while (true) {
			if (node.prev) {
				node = node.prev;
				if (node.getIsValid()) {
					this.setNode(node);
					break;
				} else {
					continue;
				}
			} else {
				this.setNode(null);
				break;
			}
		}
		return this;
	}

	public destroy():void {
		this.setNode(null);
	}

	public getName():string {
		return this._listName;
	}
}

