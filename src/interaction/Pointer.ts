/**
 * Created by i.popelyshev on 24.07.2017.
 */
namespace gobi.interaction {
	export type PointerIdentifier = number | 'MOUSE';

	export class Pointer {
		/**
		 * This point stores the global coords of where the touch/mouse event happened
		 *
		 * @member {PIXI.Point}
		 */
		global = new core.Point();

		/**
		 * The target DisplayObject that was interacted with
		 *
		 * @member {PIXI.DisplayObject}
		 */
		target: core.Node = null;

		/**
		 * When passed to an event handler, this will be the original DOM Event that was captured
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
		 * @member {MouseEvent|TouchEvent|PointerEvent}
		 */
		originalEvent: MouseEvent&TouchEvent&PointerEvent = null;

		/**
		 * Unique identifier for this interaction
		 *
		 * @member {number|string}
		 */
		identifier: PointerIdentifier = null;

		/**
		 * Indicates whether or not the pointer device that created the event is the primary pointer.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
		 * @type {Boolean}
		 */
		isPrimary = false;

		/**
		 * Indicates which button was pressed on the mouse or pointer device to trigger the event.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
		 * @type {number}
		 */
		button = 0;

		/**
		 * Indicates which buttons are pressed on the mouse or pointer device when the event is triggered.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
		 * @type {number}
		 */
		buttons = 0;

		/**
		 * The width of the pointer's contact along the x-axis, measured in CSS pixels.
		 * radiusX of TouchEvents will be represented by this value.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
		 * @type {number}
		 */
		width = 0;

		/**
		 * The height of the pointer's contact along the y-axis, measured in CSS pixels.
		 * radiusY of TouchEvents will be represented by this value.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
		 * @type {number}
		 */
		height = 0;

		/**
		 * The angle, in degrees, between the pointer device and the screen.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX
		 * @type {number}
		 */
		tiltX = 0;

		/**
		 * The angle, in degrees, between the pointer device and the screen.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY
		 * @type {number}
		 */
		tiltY = 0;

		/**
		 * The type of pointer that triggered the event.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType
		 * @type {string}
		 */
		pointerType: string = null;

		/**
		 * Pressure applied by the pointing device during the event. A Touch's force property
		 * will be represented by this value.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
		 * @type {number}
		 */
		pressure = 0;

		/**
		 * From TouchEvents (not PointerEvents triggered by touches), the rotationAngle of the Touch.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch/rotationAngle
		 * @type {number}
		 */
		rotationAngle = 0;

		/**
		 * Twist of a stylus pointer.
		 * @see https://w3c.github.io/pointerevents/#pointerevent-interface
		 * @type {number}
		 */
		twist = 0;

		/**
		 * Barrel pressure on a stylus pointer.
		 * @see https://w3c.github.io/pointerevents/#pointerevent-interface
		 * @type {number}
		 */
		tangentialPressure = 0;

		/**
		 * The unique identifier of the pointer. It will be the same as `identifier`.
		 * @readonly
		 * @member {number}
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId
		 */
		get pointerId() {
			return this.identifier;
		}

		/**
		 * This will return the local coordinates of the specified displayObject for this InteractionData
		 *
		 * @param {PIXI.DisplayObject} displayObject - The DisplayObject that you would like the local
		 *  coords off
		 * @param {PIXI.Point} [point] - A Point object in which to store the value, optional (otherwise
		 *  will create a new point)
		 * @param {PIXI.Point} [globalPos] - A Point object containing your custom global coords, optional
		 *  (otherwise will use the current global coords)
		 * @return {PIXI.Point} A point containing the coordinates of the InteractionData position relative
		 *  to the DisplayObject
		 */
		getLocalPosition(displayObject: core.Node, point?: core.IPoint, globalPos?: core.IPoint) {
			return displayObject.transform.worldTransform.applyInverse(globalPos || this.global, point);
		}

		/**
		 * Copies properties from normalized event data.
		 *
		 * @param {Touch|MouseEvent|PointerEvent} event The normalized event data
		 * @private
		 */
		_copyEvent(event: Touch | MouseEvent | PointerEvent) {
			let anyEvent = event as any;
			// isPrimary should only change on touchstart/pointerdown, so we don't want to overwrite
			// it with "false" on later events when our shim for it on touch events might not be
			// accurate
			if (anyEvent.isPrimary) {
				this.isPrimary = true;
			}
			this.button = anyEvent.button;
			this.buttons = anyEvent.buttons;
			this.width = anyEvent.width;
			this.height = anyEvent.height;
			this.tiltX = anyEvent.tiltX;
			this.tiltY = anyEvent.tiltY;
			this.pointerType = anyEvent.pointerType;
			this.pressure = anyEvent.pressure;
			this.rotationAngle = anyEvent.rotationAngle;
			this.twist = anyEvent.twist || 0;
			this.tangentialPressure = anyEvent.tangentialPressure || 0;
		}

		/**
		 * Resets the data for pooling.
		 *
		 * @private
		 */
		_reset() {
			// isPrimary is the only property that we really need to reset - everything else is
			// guaranteed to be overwritten
			this.isPrimary = false;
		}
	}
}