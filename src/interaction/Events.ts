namespace gobi.interaction {
	export type PointerEvents =
		"pointerdown"
		| "pointercancel"
		| "pointerup"
		| "pointertap"
		| "pointerupoutside"
		| "pointermove"
		| "pointerover"
		| "pointerout";
	export type MouseEvents =
		"rightdown"
		| "mousedown"
		| "rightup"
		| "mouseup"
		| "rightclick"
		| "click"
		| "rightupoutside"
		| "mouseupoutside"
		| "mousemove"
		| "mouseover"
		| "mouseout"
		| "mouseover";
	export type TouchEvents = "touchstart" | "touchcancel" | "touchend" | "touchendoutside" | "touchmove" | "tap";
	export type EventTypes = PointerEvents | TouchEvents | MouseEvents;

	export class Events {
		// node: Node;
		// constructor(node: Node) {
		// 	this.node = node;
		// }
		// enabled: boolean;

		signals: { [key: string]: Signal<(event: Event) => void> } = {};

		on(type: EventTypes, cb: (event: Event) => void) {
			let s = this.signals[type];
			if (!s) {
				s = this.signals[type] = new Signal(type);
			}
			s.addListener(cb);
			return this;
		}

		off(type: EventTypes, cb: (event: Event) => void) {
			let s = this.signals[type];
			if (!s) return this;
			s.removeListener(cb);
			return this;
		}

		once(type: EventTypes, cb: (event: Event) => void) {
			let s = this.signals[type];
			if (!s) {
				s = this.signals[type] = new Signal(type);
			}
			return s.addListenerOnce(cb);
			return this;
		}

		emit(type: EventTypes, ev: Event) {
			let s = this.signals[type];
			if (s) {
				s.emit(ev);
			}
			return this;
		}


		/**
		 * Fired when a pointer device button (usually a mouse left-button) is pressed on the display
		 * object.
		 *
		 * @event PIXI.interaction.InteractionManager#mousedown
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
		 * on the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#rightdown
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button (usually a mouse left-button) is released over the display
		 * object.
		 *
		 * @event PIXI.interaction.InteractionManager#mouseup
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device secondary button (usually a mouse right-button) is released
		 * over the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#rightup
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
		 * the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#click
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
		 * and released on the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#rightclick
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button (usually a mouse left-button) is released outside the
		 * display object that initially registered a
		 * [mousedown]{@link PIXI.interaction.InteractionManager#event:mousedown}.
		 *
		 * @event PIXI.interaction.InteractionManager#mouseupoutside
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device secondary button (usually a mouse right-button) is released
		 * outside the display object that initially registered a
		 * [rightdown]{@link PIXI.interaction.InteractionManager#event:rightdown}.
		 *
		 * @event PIXI.interaction.InteractionManager#rightupoutside
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device (usually a mouse) is moved while over the display object
		 *
		 * @event PIXI.interaction.InteractionManager#mousemove
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device (usually a mouse) is moved onto the display object
		 *
		 * @event PIXI.interaction.InteractionManager#mouseover
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device (usually a mouse) is moved off the display object
		 *
		 * @event PIXI.interaction.InteractionManager#mouseout
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button is pressed on the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#pointerdown
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button is released over the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#pointerup
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when the operating system cancels a pointer event
		 *
		 * @event PIXI.interaction.InteractionManager#pointercancel
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button is pressed and released on the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#pointertap
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button is released outside the display object that initially
		 * registered a [pointerdown]{@link PIXI.interaction.InteractionManager#event:pointerdown}.
		 *
		 * @event PIXI.interaction.InteractionManager#pointerupoutside
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device is moved while over the display object
		 *
		 * @event PIXI.interaction.InteractionManager#pointermove
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device is moved onto the display object
		 *
		 * @event PIXI.interaction.InteractionManager#pointerover
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device is moved off the display object
		 *
		 * @event PIXI.interaction.InteractionManager#pointerout
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is placed on the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#touchstart
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is removed from the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#touchend
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when the operating system cancels a touch
		 *
		 * @event PIXI.interaction.InteractionManager#touchcancel
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is placed and removed from the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#tap
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is removed outside of the display object that initially
		 * registered a [touchstart]{@link PIXI.interaction.InteractionManager#event:touchstart}.
		 *
		 * @event PIXI.interaction.InteractionManager#touchendoutside
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is moved along the display object.
		 *
		 * @event PIXI.interaction.InteractionManager#touchmove
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button (usually a mouse left-button) is pressed on the display.
		 * object. DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#mousedown
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
		 * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#rightdown
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button (usually a mouse left-button) is released over the display
		 * object. DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#mouseup
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device secondary button (usually a mouse right-button) is released
		 * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#rightup
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
		 * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#click
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
		 * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#rightclick
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button (usually a mouse left-button) is released outside the
		 * display object that initially registered a
		 * [mousedown]{@link PIXI.DisplayObject#event:mousedown}.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#mouseupoutside
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device secondary button (usually a mouse right-button) is released
		 * outside the display object that initially registered a
		 * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#rightupoutside
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device (usually a mouse) is moved while over the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#mousemove
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device (usually a mouse) is moved onto the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#mouseover
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device (usually a mouse) is moved off the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#mouseout
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button is pressed on the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#pointerdown
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button is released over the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#pointerup
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when the operating system cancels a pointer event.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#pointercancel
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button is pressed and released on the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#pointertap
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device button is released outside the display object that initially
		 * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#pointerupoutside
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device is moved while over the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#pointermove
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device is moved onto the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#pointerover
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a pointer device is moved off the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#pointerout
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is placed on the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#touchstart
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is removed from the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#touchend
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when the operating system cancels a touch.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#touchcancel
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is placed and removed from the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#tap
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is removed outside of the display object that initially
		 * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#touchendoutside
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */

		/**
		 * Fired when a touch point is moved along the display object.
		 * DisplayObject's `interactive` property must be set to `true` to fire event.
		 *
		 * @event PIXI.DisplayObject#touchmove
		 * @param {PIXI.interaction.InteractionEvent} event - Interaction event
		 */
	}
}