///ts:ref=Pointer
/// <reference path="./Pointer.ts"/> ///ts:ref:generated

namespace gobi.interaction {
	const MOUSE_POINTER_ID = 'MOUSE';

	// helpers for hitTest() - only used inside hitTest()
	const hitTestEvent = new Event();
	hitTestEvent.data = new Pointer();

	type InternalCallback = (event: Event, target: core.Node, hit: boolean) => void;

	/**
	 * The interaction manager deals with mouse, touch and pointer events. Any DisplayObject can be interactive
	 * if its interactive parameter is set to true
	 * This manager also supports multitouch.
	 *
	 * An instance of this class is automatically created by default, and can be found at renderer.plugins.interaction
	 *
	 * @class
	 * @extends EventEmitter
	 * @memberof PIXI.interaction
	 */
	export class Manager {
		events = new Events();

		/**
		 * The renderer this interaction manager works for.
		 *
		 * @member {PIXI.SystemRenderer}
		 */
		renderer: IRenderer;

		/**
		 * Should default browser actions automatically be prevented.
		 * Does not apply to pointer events for backwards compatibility
		 * preventDefault on pointer events stops mouse events from firing
		 * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
		 *
		 * @member {boolean}
		 * @default true
		 */
		autoPreventDefault: boolean;

		/**
		 * Frequency in milliseconds that the mousemove, moveover & mouseout interaction events will be checked.
		 *
		 * @member {number}
		 * @default 10
		 */
		interactionFrequency: number;

		/**
		 * The mouse data
		 *
		 * @member {PIXI.interaction.InteractionData}
		 */
		mouse = new Pointer();

		/**
		 * Actively tracked InteractionData
		 *
		 * @private
		 * @member {Object.<number,PIXI.interation.InteractionData>}
		 */
		activeInteractionData: { [key: string]: Pointer } = {};

		/**
		 * Pool of unused InteractionData
		 *
		 * @private
		 * @member {PIXI.interation.InteractionData[]}
		 */
		interactionDataPool: Array<Pointer> = [];

		/**
		 * An event data object to handle all the event tracking/dispatching
		 *
		 * @member {object}
		 */
		eventData = new Event();

		/**
		 * The DOM element to bind to.
		 *
		 * @private
		 * @member {HTMLElement}
		 */
		interactionDOMElement: HTMLElement = null;

		/**
		 * This property determines if mousemove and touchmove events are fired only when the cursor
		 * is over the object.
		 * Setting to true will make things work more in line with how the DOM verison works.
		 * Setting to false can make things easier for things like dragging
		 * It is currently set to false as this is how pixi used to work. This will be set to true in
		 * future versions of pixi.
		 *
		 * @member {boolean}
		 * @default false
		 */
		moveWhenInside = false;

		/**
		 * Have events been attached to the dom element?
		 *
		 * @private
		 * @member {boolean}
		 */
		eventsAdded = false;

		/**
		 * Is the mouse hovering over the renderer?
		 *
		 * @private
		 * @member {boolean}
		 */
		mouseOverRenderer = false;

		/**
		 * Does the device support touch events
		 * https://www.w3.org/TR/touch-events/
		 *
		 * @readonly
		 * @member {boolean}
		 */
		supportsTouchEvents = ('ontouchstart' in window);

		/**
		 * Does the device support pointer events
		 * https://www.w3.org/Submission/pointer-events/
		 *
		 * @readonly
		 * @member {boolean}
		 */
		supportsPointerEvents = !!((window as any).PointerEvent);

		/**
		 * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
		 * values, objects are handled as dictionaries of CSS values for interactionDOMElement,
		 * and functions are called instead of changing the CSS.
		 * Default CSS cursor values are provided for 'default' and 'pointer' modes.
		 * @member {Object.<string, (string|Function|Object.<string, string>)>}
		 */
		cursorStyles: { [key: string]: string | ((x: string) => void) } = {
			'default': 'inherit',
			'pointer': 'pointer',
		};

		/**
		 * The mode of the cursor that is being used.
		 * The value of this is a key from the cursorStyles dictionary.
		 *
		 * @member {string}
		 */
		currentCursorMode: string = null;

		/**
		 * Internal cached let.
		 *
		 * @private
		 * @member {string}
		 */
		cursor: string = null;

		/**
		 * Internal cached let.
		 *
		 * @private
		 * @member {PIXI.Point}
		 */
		_tempPoint = new core.Point();

		/**
		 * The current resolution / device pixel ratio.
		 *
		 * @member {number}
		 * @default 1
		 */
		resolution = 1;

		private _deltaTime: number = NaN;
		private didMove = false;

		/**
		 * @param {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer - A reference to the current renderer
		 * @param {object} [options] - The options for the manager.
		 * @param {boolean} [options.autoPreventDefault=true] - Should the manager automatically prevent default browser actions.
		 * @param {number} [options.interactionFrequency=10] - Frequency increases the interaction events will be checked.
		 */
		constructor(renderer: IRenderer, options?: any) {

			options = options || {};

			this.renderer = renderer;

			this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;

			this.interactionFrequency = options.interactionFrequency || 10;

			this.mouse.identifier = MOUSE_POINTER_ID;

			// setting the mouse to start off far off screen will mean that mouse over does
			//  not get called before we even move the mouse.
			this.mouse.global.set(-999999);


			this.activeInteractionData[MOUSE_POINTER_ID] = this.mouse;


			this.interactionDataPool = [];

			this.setTargetElement(this.renderer.view, this.renderer.resolution);
		}

		/**
		 * Hit tests a point against the display tree, returning the first interactive object that is hit.
		 *
		 * @param {PIXI.Point} globalPoint - A point to hit test with, in global space.
		 * @param {PIXI.Container} [root] - The root display object to start from. If omitted, defaults
		 * to the last rendered root of the associated renderer.
		 * @return {PIXI.DisplayObject} The hit display object, if any.
		 */
		hitTest(globalPoint: core.IPoint, root: core.Node) {
			// clear the target for our hit test
			hitTestEvent.target = null;
			// assign the global point
			hitTestEvent.data.global.copyFrom(globalPoint);
			// ensure safety of the root
			if (!root) {
				root = this.renderer._lastObjectRendered;
			}
			// run the hit test
			this.processInteractive(hitTestEvent, root, null, true);
			// return our found object - it'll be null if we didn't hit anything

			return hitTestEvent.target;
		}

		/**
		 * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
		 * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
		 * another DOM element to receive those events.
		 *
		 * @param {HTMLCanvasElement} element - the DOM element which will receive mouse and touch events.
		 * @param {number} [resolution=1] - The resolution / device pixel ratio of the new element (relative to the canvas).
		 * @private
		 */
		setTargetElement(element: HTMLCanvasElement, resolution = 1) {
			this.removeEvents();

			this.interactionDOMElement = element;

			this.resolution = resolution;

			this.addEvents();
		}

		/**
		 * Registers all the DOM events
		 *
		 * @private
		 */
		addEvents() {
			const dom = this.interactionDOMElement as any;
			if (!dom) {
				return;
			}

			// TODO: add automagically to the ticker
			// core.ticker.shared.add(this.update, this, core.UPDATE_PRIORITY.INTERACTION);

			if (window.navigator.msPointerEnabled) {
				dom.style['-ms-content-zooming'] = 'none';
				dom.style['-ms-touch-action'] = 'none';
			}
			else if (this.supportsPointerEvents) {
				dom.style['touch-action'] = 'none';
			}

			/**
			 * These events are added first, so that if pointer events are normalised, they are fired
			 * in the same order as non-normalised events. ie. pointer event 1st, mouse / touch 2nd
			 */
			if (this.supportsPointerEvents) {
				window.document.addEventListener('pointermove', this.onPointerMove, true);
				dom.addEventListener('pointerdown', this.onPointerDown, true);
				// pointerout is fired in addition to pointerup (for touch events) and pointercancel
				// we already handle those, so for the purposes of what we do in onPointerOut, we only
				// care about the pointerleave event
				dom.addEventListener('pointerleave', this.onPointerOut, true);
				dom.addEventListener('pointerover', this.onPointerOver, true);
				window.addEventListener('pointercancel', this.onPointerCancel, true);
				window.addEventListener('pointerup', this.onPointerUp, true);
			}

			else {
				window.document.addEventListener('mousemove', this.onPointerMove, true);
				dom.addEventListener('mousedown', this.onPointerDown, true);
				dom.addEventListener('mouseout', this.onPointerOut, true);
				dom.addEventListener('mouseover', this.onPointerOver, true);
				window.addEventListener('mouseup', this.onPointerUp, true);

				if (this.supportsTouchEvents) {
					dom.addEventListener('touchstart', this.onPointerDown, true);
					dom.addEventListener('touchcancel', this.onPointerCancel, true);
					dom.addEventListener('touchend', this.onPointerUp, true);
					dom.addEventListener('touchmove', this.onPointerMove, true);
				}
			}

			this.eventsAdded = true;
		}

		/**
		 * Removes all the DOM events that were previously registered
		 *
		 * @private
		 */
		removeEvents() {
			const dom = this.interactionDOMElement as any;
			if (!dom) {
				return;
			}

			// core.ticker.shared.remove(this.update, this);

			if (window.navigator.msPointerEnabled) {
				dom.style['-ms-content-zooming'] = '';
				dom.style['-ms-touch-action'] = '';
			}
			else if (this.supportsPointerEvents) {
				dom.style['touch-action'] = '';
			}

			if (this.supportsPointerEvents) {
				window.document.removeEventListener('pointermove', this.onPointerMove, true);
				dom.removeEventListener('pointerdown', this.onPointerDown, true);
				dom.removeEventListener('pointerleave', this.onPointerOut, true);
				dom.removeEventListener('pointerover', this.onPointerOver, true);
				window.removeEventListener('pointercancel', this.onPointerCancel, true);
				window.removeEventListener('pointerup', this.onPointerUp, true);
			}
			else {
				window.document.removeEventListener('mousemove', this.onPointerMove, true);
				dom.removeEventListener('mousedown', this.onPointerDown, true);
				dom.removeEventListener('mouseout', this.onPointerOut, true);
				dom.removeEventListener('mouseover', this.onPointerOver, true);
				window.removeEventListener('mouseup', this.onPointerUp, true);

				if (this.supportsTouchEvents) {
					dom.removeEventListener('touchstart', this.onPointerDown, true);
					dom.removeEventListener('touchcancel', this.onPointerCancel, true);
					dom.removeEventListener('touchend', this.onPointerUp, true);
					dom.removeEventListener('touchmove', this.onPointerMove, true);
				}
			}

			this.interactionDOMElement = null;

			this.eventsAdded = false;
		}

		/**
		 * Updates the state of interactive objects.
		 * Invoked by a throttled ticker update from {@link PIXI.ticker.shared}.
		 *
		 * @param {number} deltaTime - time delta since last tick
		 */
		update(deltaTime: number) {
			this._deltaTime += deltaTime;

			if (this._deltaTime < this.interactionFrequency) {
				return;
			}

			this._deltaTime = 0;

			if (!this.interactionDOMElement) {
				return;
			}

			// if the user move the mouse this check has already been done using the mouse move!
			if (this.didMove) {
				this.didMove = false;

				return;
			}

			this.cursor = null;

			// Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
			// but there was a scenario of a display object moving under a static mouse cursor.
			// In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
			for (const k in this.activeInteractionData) {
				// eslint-disable-next-line no-prototype-builtins
				if (this.activeInteractionData.hasOwnProperty(k)) {
					const interactionData = this.activeInteractionData[k];

					if (interactionData.originalEvent && interactionData.pointerType !== 'touch') {
						const interactionEvent = this.configureInteractionEventForDOMEvent(
							this.eventData,
							interactionData.originalEvent,
							interactionData
						);

						this.processInteractive(
							interactionEvent,
							this.renderer._lastObjectRendered,
							this.processPointerOverOut,
							true
						);
					}
				}
			}

			this.setCursorMode(this.cursor);

			// TODO
		}

		/**
		 * Sets the current cursor mode, handling any callbacks or CSS style changes.
		 *
		 * @param {string} mode - cursor mode, a key from the cursorStyles dictionary
		 */
		setCursorMode(mode: string) {
			const dom = this.interactionDOMElement as any;
			mode = mode || 'default';
			// if the mode didn't actually change, bail early
			if (this.currentCursorMode === mode) {
				return;
			}
			this.currentCursorMode = mode;
			const style = this.cursorStyles[mode as any];

			// only do things if there is a cursor style for it
			if (style) {
				switch (typeof style) {
					case 'string':
						// string styles are handled as cursor CSS
						dom.style.cursor = style;
						break;
					case 'function':
						// functions are just called, and passed the cursor mode
						(style as any)(mode);
						break;
					case 'object':
						// if it is an object, assume that it is a dictionary of CSS styles,
						// apply it to the interactionDOMElement
						(Object as any).assign(dom.style, style);
						break;
				}
			}
		}

		/**
		 * Dispatches an event on the display object that was interacted with
		 *
		 * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - the display object in question
		 * @param {string} eventString - the name of the event (e.g, mousedown)
		 * @param {object} eventData - the event data object
		 * @private
		 */
		dispatchEvent(displayObject: core.Node, eventString: EventTypes, eventData: Event) {
			if (!eventData.stopped) {
				eventData.currentTarget = displayObject;
				eventData.type = eventString;

				displayObject.events.emit(eventString, eventData);

				// if (displayObject[eventString]) {
				// 	displayObject[eventString](eventData);
				// }
			}
		}

		/**
		 * Maps x and y coords from a DOM object and maps them correctly to the pixi view. The
		 * resulting value is stored in the point. This takes into account the fact that the DOM
		 * element could be scaled and positioned anywhere on the screen.
		 *
		 * @param  {PIXI.Point} point - the point that the result will be stored in
		 * @param  {number} x - the x coord of the position to map
		 * @param  {number} y - the y coord of the position to map
		 */
		mapPositionToPoint(point: core.IPoint, x: number, y: number) {
			let rect;
			const dom = this.interactionDOMElement as any;

			// IE 11 fix
			if (!dom.parentElement) {
				rect = {x: 0, y: 0, width: 0, height: 0};
			}
			else {
				rect = dom.getBoundingClientRect();
			}

			const resolutionMultiplier = navigator.isCocoonJS ? this.resolution : (1.0 / this.resolution);

			point.x = ((x - rect.left) * (dom.width / rect.width)) * resolutionMultiplier;
			point.y = ((y - rect.top) * (dom.height / rect.height)) * resolutionMultiplier;
		}

		/**
		 * This function is provides a neat way of crawling through the scene graph and running a
		 * specified function on all interactive objects it finds. It will also take care of hit
		 * testing the interactive objects and passes the hit across in the function.
		 *
		 * @private
		 * @param {PIXI.interaction.InteractionEvent} interactionEvent - event containing the point that
		 *  is tested for collision
		 * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} node - the displayObject
		 *  that will be hit test (recursively crawls its children)
		 * @param {Function} [func] - the function that will be called on each interactive object. The
		 *  interactionEvent, displayObject and hit will be passed to the function
		 * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
		 * @param {boolean} [interactive] - Whether the displayObject is interactive
		 * @return {boolean} returns true if the displayObject hit the point
		 */
		processInteractive(interactionEvent: Event, node: core.Node, func: InternalCallback,
		                   hitTest: boolean, interactive?: boolean) {
			if (!node || !node.visible) {
				return false;
			}

			const point = interactionEvent.data.global;

			// Took a little while to rework this function correctly! But now it is done and nice and optimised. ^_^
			//
			// This function will now loop through all objects and then only hit test the objects it HAS
			// to, not all of them. MUCH faster..
			// An object will be hit test if the following is true:
			//
			// 1: It is interactive.
			// 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
			//
			// As another little optimisation once an interactive object has been hit we can carry on
			// through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
			// A final optimisation is that an object is not hit test directly if a child has already been hit.

			interactive = node.interactive || interactive;

			let hit = false;
			let interactiveParent = interactive;

			// if the displayobject has a hitArea, then it does not need to hitTest children.
			if (node.hitArea) {
				interactiveParent = false;
			}
			// it has a mask! Then lets hit test that before continuing
			else if (hitTest && node._mask) {
				if (!node._mask.displayObject.containsPoint(point)) {
					hitTest = false;
				}
			}

			// ** FREE TIP **! If an object is not interactive or has no buttons in it
			// (such as a game scene!) set interactiveChildren to false for that displayObject.
			// This will allow pixi to completely ignore and bypass checking the displayObjects children.
			if (node.interactiveChildren && node.children) {
				const children = node.children;

				for (let i = children.length - 1; i >= 0; i--) {
					const child = children[i];

					// time to get recursive.. if this function will return if something is hit..
					const childHit = this.processInteractive(interactionEvent, child, func, hitTest, interactiveParent);

					if (childHit) {
						// its a good idea to check if a child has lost its parent.
						// this means it has been removed whilst looping so its best
						if (!child.parent) {
							continue;
						}

						// we no longer need to hit test any more objects in this container as we we
						// now know the parent has been hit
						interactiveParent = false;

						// If the child is interactive , that means that the object hit was actually
						// interactive and not just the child of an interactive object.
						// This means we no longer need to hit test anything else. We still need to run
						// through all objects, but we don't need to perform any hit tests.

						if (childHit) {
							if (interactionEvent.target) {
								hitTest = false;
							}
							hit = true;
						}
					}
				}
			}

			// no point running this if the item is not interactive or does not have an interactive parent.
			if (interactive) {
				// if we are hit testing (as in we have no hit any objects yet)
				// We also don't need to worry about hit testing if once of the displayObjects children
				// has already been hit - but only if it was interactive, otherwise we need to keep
				// looking for an interactive child, just in case we hit one
				if (hitTest && !interactionEvent.target) {
					if (node.hitArea) {
						node.transform.worldTransform.applyInverse(point, this._tempPoint);
						if (node.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
							hit = true;
						}
					}
					else if (node.displayObject && node.displayObject.containsPoint) {
						if (node.displayObject.containsPoint(point)) {
							hit = true;
						}
					}
				}

				if (node.interactive) {
					if (hit && !interactionEvent.target) {
						interactionEvent.target = node;
					}

					if (func) {
						func(interactionEvent, node, !!hit);
					}
				}
			}

			return hit;
		}

		/**
		 * Is called when the pointer button is pressed down on the renderer element
		 *
		 * @private
		 * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
		 */
		onPointerDown = (originalEvent: PointerEvent) => {
			const events = this.normalizeToPointerData(originalEvent);

			/**
			 * No need to prevent default on natural pointer events, as there are no side effects
			 * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
			 * so still need to be prevented.
			 */

			// Guaranteed that there will be at least one event in events, and all events must have the same pointer type

			if (this.autoPreventDefault && events[0].isNormalized) {
				originalEvent.preventDefault();
			}

			const eventLen = events.length;

			for (let i = 0; i < eventLen; i++) {
				const event = events[i];

				const interactionData = this.getInteractionDataForPointerId(event);

				const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

				interactionEvent.data.originalEvent = originalEvent as any;

				this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerDown, true);

				this.events.emit('pointerdown', interactionEvent);
				if (event.pointerType === 'touch') {
					this.events.emit('touchstart', interactionEvent);
				}
				else if (event.pointerType === 'mouse') {
					const isRightButton = event.button === 2 || event.which === 3;

					this.events.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
				}
			}
		};

		/**
		 * Processes the result of the pointer down check and dispatches the event if need be
		 *
		 * @private
		 * @param {PIXI.interaction.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
		 * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
		 * @param {boolean} hit - the result of the hit test on the display object
		 */
		processPointerDown = (interactionEvent: Event, displayObject: core.Node, hit: boolean) => {
			const e = interactionEvent.data.originalEvent;

			const id = interactionEvent.data.identifier;

			if (hit) {
				if (!displayObject.trackedPointers[id]) {
					displayObject.trackedPointers[id] = new TrackingData(id);
				}
				this.dispatchEvent(displayObject, 'pointerdown', interactionEvent);

				if (e.type === 'touchstart' || e.pointerType === 'touch') {
					this.dispatchEvent(displayObject, 'touchstart', interactionEvent);
				}
				else if (e.type === 'mousedown' || e.pointerType === 'mouse') {
					const isRightButton = e.button === 2 || e.which === 3;

					if (isRightButton) {
						displayObject.trackedPointers[id].rightDown = true;
					}
					else {
						displayObject.trackedPointers[id].leftDown = true;
					}

					this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', interactionEvent);
				}
			}
		};

		/**
		 * Is called when the pointer button is released on the renderer element
		 *
		 * @private
		 * @param {PointerEvent} originalEvent - The DOM event of a pointer button being released
		 * @param {boolean} cancelled - true if the pointer is cancelled
		 * @param {Function} func - Function passed to {@link processInteractive}
		 */
		onPointerComplete = (originalEvent: PointerEvent, cancelled: boolean, func: InternalCallback) => {
			const events = this.normalizeToPointerData(originalEvent);

			const eventLen = events.length;

			for (let i = 0; i < eventLen; i++) {
				const event = events[i];

				const interactionData = this.getInteractionDataForPointerId(event);

				const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

				interactionEvent.data.originalEvent = originalEvent as any;

				this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, func, true);

				this.events.emit(cancelled ? 'pointercancel' : 'pointerup', interactionEvent);

				if (event.pointerType === 'mouse') {
					const isRightButton = event.button === 2 || event.which === 3;

					this.events.emit(isRightButton ? 'rightup' : 'mouseup', interactionEvent);
				}
				else if (event.pointerType === 'touch') {
					this.events.emit(cancelled ? 'touchcancel' : 'touchend', interactionEvent);
					//TODO: pixifix
					// this.releaseInteractionDataForPointerId(event.pointerId, interactionData);
					this.releaseInteractionDataForPointerId(event.pointerId);
				}
			}
		};

		/**
		 * Is called when the pointer button is cancelled
		 *
		 * @private
		 * @param {PointerEvent} event - The DOM event of a pointer button being released
		 */
		onPointerCancel = (event: PointerEvent) => {
			this.onPointerComplete(event, true, this.processPointerCancel);
		};

		/**
		 * Processes the result of the pointer cancel check and dispatches the event if need be
		 *
		 * @private
		 * @param {PIXI.interaction.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
		 * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
		 */
		processPointerCancel = (interactionEvent: Event, displayObject: core.Node) => {
			const e = interactionEvent.data.originalEvent;

			const id = interactionEvent.data.identifier;

			if (displayObject.trackedPointers[id] !== undefined) {
				delete displayObject.trackedPointers[id];
				this.dispatchEvent(displayObject, 'pointercancel', interactionEvent);

				if (e.type === 'touchcancel' || e.pointerType === 'touch') {
					this.dispatchEvent(displayObject, 'touchcancel', interactionEvent);
				}
			}
		};

		/**
		 * Is called when the pointer button is released on the renderer element
		 *
		 * @private
		 * @param {PointerEvent} event - The DOM event of a pointer button being released
		 */
		onPointerUp = (event: PointerEvent) => {
			this.onPointerComplete(event, false, this.processPointerUp);
		};

		/**
		 * Processes the result of the pointer up check and dispatches the event if need be
		 *
		 * @private
		 * @param {PIXI.interaction.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
		 * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
		 * @param {boolean} hit - the result of the hit test on the display object
		 */
		processPointerUp = (interactionEvent: Event, displayObject: core.Node, hit: boolean) => {
			const e = interactionEvent.data.originalEvent;

			const id = interactionEvent.data.identifier;

			const trackingData = displayObject.trackedPointers[id];

			const isTouch = (e.type === 'touchend' || e.pointerType === 'touch');

			const isMouse = (e.type.indexOf('mouse') === 0 || e.pointerType === 'mouse');

			// Mouse only
			if (isMouse) {
				const isRightButton = e.button === 2 || e.which === 3;

				const flags = TrackingData.FLAGS;

				const test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;

				const isDown = trackingData !== undefined && (trackingData.flags & test);

				if (hit) {
					this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);

					if (isDown) {
						this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
					}
				}
				else if (isDown) {
					this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
				}
				// update the down state of the tracking data
				if (trackingData) {
					if (isRightButton) {
						trackingData.rightDown = false;
					}
					else {
						trackingData.leftDown = false;
					}
				}
			}

			// Pointers and Touches, and Mouse
			if (hit) {
				this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
				if (isTouch) this.dispatchEvent(displayObject, 'touchend', interactionEvent);

				if (trackingData) {
					this.dispatchEvent(displayObject, 'pointertap', interactionEvent);
					if (isTouch) {
						this.dispatchEvent(displayObject, 'tap', interactionEvent);
						// touches are no longer over (if they ever were) when we get the touchend
						// so we should ensure that we don't keep pretending that they are
						trackingData.over = false;
					}
				}
			}
			else if (trackingData) {
				this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
				if (isTouch) this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent);
			}
			// Only remove the tracking data if there is no over/down state still associated with it
			if (trackingData && trackingData.none) {
				delete displayObject.trackedPointers[id];
			}
		};

		/**
		 * Is called when the pointer moves across the renderer element
		 *
		 * @private
		 * @param {PointerEvent} originalEvent - The DOM event of a pointer moving
		 */
		onPointerMove = (originalEvent: PointerEvent) => {
			const events = this.normalizeToPointerData(originalEvent);

			if (events[0].pointerType === 'mouse') {
				this.didMove = true;

				this.cursor = null;
			}

			const eventLen = events.length;

			for (let i = 0; i < eventLen; i++) {
				const event = events[i];

				const interactionData = this.getInteractionDataForPointerId(event);

				const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

				interactionEvent.data.originalEvent = originalEvent as any;

				const interactive = event.pointerType === 'touch' ? this.moveWhenInside : true;

				this.processInteractive(
					interactionEvent,
					this.renderer._lastObjectRendered,
					this.processPointerMove,
					interactive
				);
				this.events.emit('pointermove', interactionEvent);
				if (event.pointerType === 'touch') this.events.emit('touchmove', interactionEvent);
				if (event.pointerType === 'mouse') this.events.emit('mousemove', interactionEvent);
			}

			if (events[0].pointerType === 'mouse') {
				this.setCursorMode(this.cursor);

				// TODO BUG for parents interactive object (border order issue)
			}
		};

		/**
		 * Processes the result of the pointer move check and dispatches the event if need be
		 *
		 * @private
		 * @param {PIXI.interaction.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
		 * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
		 * @param {boolean} hit - the result of the hit test on the display object
		 */
		processPointerMove = (interactionEvent: Event, displayObject: core.Node, hit: boolean) => {
			const e = interactionEvent.data.originalEvent;

			const isTouch = (e.type === 'touchmove' || e.pointerType === 'touch');

			const isMouse = (e.type === 'mousemove' || e.pointerType === 'mouse');

			if (isMouse) {
				this.processPointerOverOut(interactionEvent, displayObject, hit);
			}

			if (!this.moveWhenInside || hit) {
				this.dispatchEvent(displayObject, 'pointermove', interactionEvent);
				if (isTouch) this.dispatchEvent(displayObject, 'touchmove', interactionEvent);
				if (isMouse) this.dispatchEvent(displayObject, 'mousemove', interactionEvent);
			}
		};

		/**
		 * Is called when the pointer is moved out of the renderer element
		 *
		 * @private
		 * @param {PointerEvent} originalEvent - The DOM event of a pointer being moved out
		 */
		onPointerOut = (originalEvent: PointerEvent) => {
			const events = this.normalizeToPointerData(originalEvent);

			// Only mouse and pointer can call onPointerOut, so events will always be length 1
			const event = events[0];

			if (event.pointerType === 'mouse') {
				this.mouseOverRenderer = false;
				this.setCursorMode(null);
			}

			const interactionData = this.getInteractionDataForPointerId(event);

			const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

			interactionEvent.data.originalEvent = event;

			this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerOverOut, false);

			this.events.emit('pointerout', interactionEvent);
			if (event.pointerType === 'mouse') {
				this.events.emit('mouseout', interactionEvent);
			}
			else {
				// we can get touchleave events after touchend, so we want to make sure we don't
				// introduce memory leaks
				this.releaseInteractionDataForPointerId(interactionData.identifier);
			}
		};

		/**
		 * Processes the result of the pointer over/out check and dispatches the event if need be
		 *
		 * @private
		 * @param {PIXI.interaction.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
		 * @param {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject - The display object that was tested
		 * @param {boolean} hit - the result of the hit test on the display object
		 */
		processPointerOverOut = (interactionEvent: Event, displayObject: core.Node, hit: boolean) => {
			const e = interactionEvent.data.originalEvent;

			const id = interactionEvent.data.identifier;

			const isMouse = (e.type === 'mouseover' || e.type === 'mouseout' || e.pointerType === 'mouse');

			let trackingData = displayObject.trackedPointers[id];

			// if we just moused over the display object, then we need to track that state
			if (hit && !trackingData) {
				trackingData = displayObject.trackedPointers[id] = new TrackingData(id);
			}

			if (trackingData === undefined) return;

			if (hit && this.mouseOverRenderer) {
				if (!trackingData.over) {
					trackingData.over = true;
					this.dispatchEvent(displayObject, 'pointerover', interactionEvent);
					if (isMouse) {
						this.dispatchEvent(displayObject, 'mouseover', interactionEvent);
					}
				}

				// only change the cursor if it has not already been changed (by something deeper in the
				// display tree)
				if (isMouse && this.cursor === null) {
					this.cursor = displayObject.cursor;
				}
			}
			else if (trackingData.over) {
				trackingData.over = false;
				this.dispatchEvent(displayObject, 'pointerout', this.eventData);
				if (isMouse) {
					this.dispatchEvent(displayObject, 'mouseout', interactionEvent);
				}
				// if there is no mouse down information for the pointer, then it is safe to delete
				if (trackingData.none) {
					delete displayObject.trackedPointers[id];
				}
			}
		};

		/**
		 * Is called when the pointer is moved into the renderer element
		 *
		 * @private
		 * @param {PointerEvent} originalEvent - The DOM event of a pointer button being moved into the renderer view
		 */
		onPointerOver = (originalEvent: PointerEvent) => {
			const events = this.normalizeToPointerData(originalEvent);

			// Only mouse and pointer can call onPointerOver, so events will always be length 1
			const event = events[0];

			const interactionData = this.getInteractionDataForPointerId(event);

			const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

			interactionEvent.data.originalEvent = event;

			if (event.pointerType === 'mouse') {
				this.mouseOverRenderer = true;
			}

			this.events.emit('pointerover', interactionEvent);
			if (event.pointerType === 'mouse') {
				this.events.emit('mouseover', interactionEvent);
			}
		};

		/**
		 * Get InteractionData for a given pointerId. Store that data as well
		 *
		 * @private
		 * @param {PointerEvent} event - Normalized pointer event, output from normalizeToPointerData
		 * @return {PIXI.interaction.InteractionData} - Interaction data for the given pointer identifier
		 */
		getInteractionDataForPointerId(event: any) {
			const pointerId = event.pointerId;

			if (pointerId === MOUSE_POINTER_ID || event.pointerType === 'mouse') {
				return this.mouse;
			}
			else if (this.activeInteractionData[pointerId]) {
				return this.activeInteractionData[pointerId];
			}

			const interactionData = this.interactionDataPool.pop() || new Pointer();

			interactionData.identifier = pointerId;
			this.activeInteractionData[pointerId] = interactionData;

			return interactionData;
		}

		/**
		 * Return unused InteractionData to the pool, for a given pointerId
		 *
		 * @private
		 * @param {number} pointerId - Identifier from a pointer event
		 */
		releaseInteractionDataForPointerId(pointerId: PointerIdentifier) {
			const interactionData = this.activeInteractionData[pointerId];

			if (interactionData) {
				delete this.activeInteractionData[pointerId];
				this.interactionDataPool.push(interactionData);
			}
		}

		/**
		 * Configure an InteractionEvent to wrap a DOM PointerEvent and InteractionData
		 *
		 * @private
		 * @param {PIXI.interaction.InteractionEvent} interactionEvent - The event to be configured
		 * @param {PointerEvent} pointerEvent - The DOM event that will be paired with the InteractionEvent
		 * @param {PIXI.interaction.InteractionData} interactionData - The InteractionData that will be paired
		 *        with the InteractionEvent
		 * @return {PIXI.interaction.InteractionEvent} the interaction event that was passed in
		 */
		configureInteractionEventForDOMEvent(interactionEvent: Event, pointerEvent: any, interactionData: Pointer) {
			interactionEvent.data = interactionData;

			this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);

			// This is the way InteractionManager processed touch events before the refactoring, so I've kept
			// it here. But it doesn't make that much sense to me, since mapPositionToPoint already factors
			// in this.resolution, so this just divides by this.resolution twice for touch events...
			if (navigator.isCocoonJS && pointerEvent.pointerType === 'touch') {
				interactionData.global.x = interactionData.global.x / this.resolution;
				interactionData.global.y = interactionData.global.y / this.resolution;
			}

			// Not really sure why this is happening, but it's how a previous version handled things
			if (pointerEvent.pointerType === 'touch') {
				pointerEvent.globalX = interactionData.global.x;
				pointerEvent.globalY = interactionData.global.y;
			}

			interactionData.originalEvent = pointerEvent;
			interactionEvent._reset();

			return interactionEvent;
		}

		/**
		 * Ensures that the original event object contains all data that a regular pointer event would have
		 *
		 * @private
		 * @param {TouchEvent|MouseEvent|PointerEvent} event_ - The original event data from a touch or mouse event
		 * @return {PointerEvent[]} An array containing a single normalized pointer event, in the case of a pointer
		 *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
		 */
		normalizeToPointerData(event_: TouchEvent | MouseEvent | PointerEvent): any {
			const event = event_ as any;
			const normalizedEvents = [];

			if (this.supportsTouchEvents && event_ instanceof TouchEvent) {
				for (let i = 0, li = event.changedTouches.length; i < li; i++) {
					const touch = event.changedTouches[i];

					if (typeof touch.button === 'undefined') touch.button = event.touches.length ? 1 : 0;
					if (typeof touch.buttons === 'undefined') touch.buttons = event.touches.length ? 1 : 0;
					if (typeof touch.isPrimary === 'undefined') touch.isPrimary = event.touches.length === 1;
					if (typeof touch.width === 'undefined') touch.width = touch.radiusX || 1;
					if (typeof touch.height === 'undefined') touch.height = touch.radiusY || 1;
					if (typeof touch.tiltX === 'undefined') touch.tiltX = 0;
					if (typeof touch.tiltY === 'undefined') touch.tiltY = 0;
					if (typeof touch.pointerType === 'undefined') touch.pointerType = 'touch';
					if (typeof touch.pointerId === 'undefined') touch.pointerId = touch.identifier || 0;
					if (typeof touch.pressure === 'undefined') touch.pressure = touch.force || 0.5;
					if (typeof touch.rotation === 'undefined') touch.rotation = touch.rotationAngle || 0;

					if (typeof touch.layerX === 'undefined') touch.layerX = touch.offsetX = touch.clientX;
					if (typeof touch.layerY === 'undefined') touch.layerY = touch.offsetY = touch.clientY;

					// mark the touch as normalized, just so that we know we did it
					touch.isNormalized = true;

					normalizedEvents.push(touch);
				}
			}
			// apparently PointerEvent subclasses MouseEvent, so yay
			else if (event_ instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof (window as any).PointerEvent))) {
				if (typeof event.isPrimary === 'undefined') event.isPrimary = true;
				if (typeof event.width === 'undefined') event.width = 1;
				if (typeof event.height === 'undefined') event.height = 1;
				if (typeof event.tiltX === 'undefined') event.tiltX = 0;
				if (typeof event.tiltY === 'undefined') event.tiltY = 0;
				if (typeof event.pointerType === 'undefined') event.pointerType = 'mouse';
				if (typeof event.pointerId === 'undefined') event.pointerId = MOUSE_POINTER_ID;
				if (typeof event.pressure === 'undefined') event.pressure = 0.5;
				if (typeof event.rotation === 'undefined') event.rotation = 0;

				// mark the mouse event as normalized, just so that we know we did it
				event.isNormalized = true;

				normalizedEvents.push(event);
			}
			else {
				normalizedEvents.push(event);
			}

			return normalizedEvents;
		}

		/**
		 * Destroys the interaction manager
		 *
		 */
		destroy() {
			this.removeEvents();

			// this.removeAllListeners();

			this.renderer = null;

			this.mouse = null;

			this.eventData = null;

			this.interactionDOMElement = null;

			this.onPointerDown = null;
			this.processPointerDown = null;

			this.onPointerUp = null;
			this.processPointerUp = null;

			this.onPointerCancel = null;
			this.processPointerCancel = null;

			this.onPointerMove = null;
			this.processPointerMove = null;

			this.onPointerOut = null;
			this.processPointerOverOut = null;

			this.onPointerOver = null;

			this._tempPoint = null;
		}
	}
}