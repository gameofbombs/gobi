namespace gobi.panda {
    export class PandaTicker {
        lastTimeStamp: number = 0;
        cancelThing: number = 0;

        constructor() {
            this.onEnterFrame = new Signal<(millisecondsDelta: number, millisecondsAbsolute: number) => void>();
            this.lastTimeStamp = performance.now();
        }

        onEnterFrame: Signal<(millisecondsDelta: number, millisecondsAbsolute: number) => void> = null;

        FPS = 60.0 / 1000.0;

        handler_animationFrame = () => {
            let now = performance.now();
            let delta = now - this.lastTimeStamp;
            this.lastTimeStamp = now;
            
            this.onEnterFrame.emit(delta * this.FPS, now);
            this.cancelThing = requestAnimationFrame(this.handler_animationFrame);
            let after = performance.now();
        };

        add(f: (millisecondsDelta: number, millisecondsAbsolute: number) => void) {
            this.onEnterFrame.addListener(f);
        }

        remove(f: (millisecondsDelta: number, millisecondsAbsolute: number) => void) {
            this.onEnterFrame.removeListener(f);
        }

        nextFrameCall(f: () => void): void {
            let creationTimestamp = this.lastTimeStamp;
            let listener = this.onEnterFrame.addListener(() => {
                if (this.lastTimeStamp != creationTimestamp) {
                    this.onEnterFrame.removeListener(listener);
                    f();
                }
            });
        }

        start() {
            if (this.cancelThing) return;
            this.lastTimeStamp = performance.now();
            this.cancelThing = requestAnimationFrame(this.handler_animationFrame);
        }

        stop() {
            if (!this.cancelThing) return;
            window.cancelAnimationFrame(this.cancelThing);
            this.cancelThing = 0;
        }

        destroy() {
            this.stop();
        }
    }
}
