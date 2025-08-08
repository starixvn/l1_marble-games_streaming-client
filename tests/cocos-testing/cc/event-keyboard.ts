import { KeyCode } from "./key-code";
import { Event } from "./event";

export type SystemEventTypeUnion = "keydown" | "keyup";

export class EventKeyboard extends Event {
    windowId: number;
    keyCode: KeyCode;
    rawEvent?: KeyboardEvent;
    private _isPressed: boolean;

    constructor(keyCode: KeyCode | KeyboardEvent, eventType: SystemEventTypeUnion | boolean = "keydown", bubbles: boolean = true) {
        // Handle the legacy constructor signature where second param was isPressed
        const type = typeof eventType === "boolean" ? "keydown" : eventType;
        super(type, bubbles);

        this.windowId = 0;
        this._isPressed = typeof eventType === "boolean" ? eventType : type === "keydown";
        this.keyCode = keyCode instanceof KeyboardEvent ? KeyCode.NONE : keyCode;
    }

    get isPressed(): boolean {
        return this._isPressed;
    }

    preventDefault(): void {
        // Mock implementation
    }

    stopPropagation(): void {
        this.propagationStopped = true;
    }

    stopImmediatePropagation(): void {
        this.propagationImmediateStopped = true;
    }

    unuse(): void {
        // Mock implementation
    }

    reuse(): void {
        // Mock implementation
    }

    isStopped(): boolean {
        return this.propagationStopped || this.propagationImmediateStopped;
    }

    getCurrentTarget(): any {
        return this.currentTarget;
    }

    getType(): string {
        return this.type;
    }
}
