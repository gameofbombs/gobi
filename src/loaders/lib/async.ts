namespace gobi.loaders.lib.async {

	/**
	 * Smaller version of the async library constructs.
	 *
	 */
	function _noop() { /* empty */
	}

	/**
	 * Iterates an array in series.
	 *
	 * @param {Array.<*>} array - Array to iterate.
	 * @param {function} iterator - Function to call for each element.
	 * @param {function} callback - Function to call when done, or on error.
	 * @param {boolean} [deferNext=false] - Break synchronous each loop by calling next with a setTimeout of 1.
	 */
	export function eachSeries(array: Array<any>, iterator: (x: any, next: (err?: any) => void) => void,
	                           callback?: (err?: any) => void, deferNext?: boolean): void {
		let i = 0;
		const len = array.length;

		function next(err?: any) {
			if (err || i === len) {
				if (callback) {
					callback(err);
				}

				return;
			}

			if (deferNext) {
				setTimeout(() => {
					iterator(array[i++], next);
				}, 1);
			}
			else {
				iterator(array[i++], next);
			}
		}

		next();
	}

	/**
	 * Ensures a function is only called once.
	 *
	 * @param {function} fn - The function to wrap.
	 * @return {function} The wrapping function.
	 */
	function onlyOnce(fn: Function): Function {
		return function onceWrapper() {
			if (fn === null) {
				throw new Error('Callback was already called.');
			}

			const callFn = fn;

			fn = null;
			callFn.apply(this, arguments);
		};
	}

	export interface IQueue {

	}

	export class Item<TaskData> {
		data: TaskData;
		callback: Function;

		constructor(data: TaskData, callback: Function) {
			this.data = data;
			this.callback = callback;
		}
	}

	export class AsyncQueue<TaskData> {
		workers: number = 0;

		concurrency: number;
		buffers: number;

		saturated: () => void = _noop;
		unsaturated: () => void = _noop;
		empty: () => void = _noop;
		drain: () => void = _noop;
		error: (err: Error, task: TaskData) => void = _noop;

		started = false;
		paused = false;

		private _worker: (x: TaskData, next: Function) => void;
		_tasks: Array<Item<TaskData>> = [];

		constructor(worker: (x: TaskData, next: Function) => void, concurrency?: number) {
			this._worker = worker;

			if (concurrency == null) { // eslint-disable-line no-eq-null,eqeqeq
				concurrency = 1;
			}
			else if (concurrency === 0) {
				throw new Error('Concurrency must not be zero');
			}

			this.concurrency = concurrency;
			this.buffers = concurrency >> 2;
		}

		private _insert = (data: any, insertAtFront: boolean, callback?: Function) => {
			if (callback != null && typeof callback !== 'function') { // eslint-disable-line no-eq-null,eqeqeq
				throw new Error('task callback must be a function');
			}

			this.started = true;

			if (data == null && this.idle()) { // eslint-disable-line no-eq-null,eqeqeq
				// call drain immediately if there are no tasks
				setTimeout(() => this.drain(), 1);
				return;
			}

			const item = new Item<TaskData>(
				data,
				typeof callback === 'function' ? callback : _noop
			);

			if (insertAtFront) {
				this._tasks.unshift(item);
			}
			else {
				this._tasks.push(item);
			}

			setTimeout(this.process, 1);
		};

		process = () => {
			while (!this.paused && this.workers < this.concurrency && this._tasks.length) {
				const task = this._tasks.shift();

				if (this._tasks.length === 0) {
					this.empty();
				}

				this.workers += 1;

				if (this.workers === this.concurrency) {
					this.saturated();
				}

				this._worker(task.data, onlyOnce(this._next(task)));
			}
		};

		_next(task: Item<TaskData>) {
			const q = this;
			return function next() {
				q.workers -= 1;

				task.callback.apply(task, arguments);

				if (arguments[0] != null) { // eslint-disable-line no-eq-null,eqeqeq
					q.error(arguments[0], task.data);
				}

				if (q.workers <= (q.concurrency - q.buffers)) {
					q.unsaturated();
				}

				if (q.idle()) {
					q.drain();
				}

				q.process();
			};
		};

		//That was in object

		push(data: any, callback?: Function) {
			this._insert(data, false, callback);
		}

		kill() {
			this.workers = 0;
			this.drain = _noop;
			this.started = false;
			this._tasks = [];
		}

		unshift(data: any, callback?: Function) {
			this._insert(data, true, callback);
		}

		length() {
			return this._tasks.length;
		}

		running() {
			return this.workers;
		}

		idle() {
			return this._tasks.length + this.workers === 0;
		}

		pause() {
			if (this.paused === true) {
				return;
			}

			this.paused = true;
		}

		resume() {
			if (this.paused === false) {
				return;
			}

			this.paused = false;

			// Need to call this.process once per concurrent
			// worker to preserve full concurrency after pause
			for (let w = 1; w <= this.concurrency; w++) {
				this.process();
			}
		}
	}

	/**
	 * Async queue implementation,
	 *
	 * @param {function} worker - The worker function to call for each task.
	 * @param {number} concurrency - How many workers to run in parrallel.
	 * @return {*} The async queue object.
	 */
	export function queue(worker: (x: any, next: Function) => void, concurrency?: number) {
		return new AsyncQueue<any>(worker, concurrency);
	}
}
