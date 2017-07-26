namespace gobi.interaction {
	export class Event {
		/**
		 * Whether this event will continue propagating in the tree
		 *
		 * @member {boolean}
		 */
		stopped = false;

		/**
		 * The object which caused this event to be dispatched.
		 * For listener callback see {@link PIXI.interaction.InteractionEvent.currentTarget}.
		 *
		 * @member {PIXI.DisplayObject}
		 */
		target : core.Node = null;

		/**
		 * The object whose event listener’s callback is currently being invoked.
		 *
		 * @member {PIXI.DisplayObject}
		 */
		currentTarget : core.Node = null;

		/**
		 * Type of the event
		 *
		 * @member {string}
		 */
		type : string = null;

		/**
		 * InteractionData related to this event
		 *
		 * @member {PIXI.interaction.InteractionData}
		 */
		data : Pointer = null;

		/**
		 * Prevents event from reaching any objects other than the current object.
		 *
		 */
		stopPropagation() {
			this.stopped = true;
		}

		/**
		 * Resets the event.
		 *
		 * @private
		 */
		_reset() {
			this.stopped = false;
			this.currentTarget = null;
			this.target = null;
		}
	}
}
