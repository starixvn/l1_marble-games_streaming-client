export class Event {
    type: string;
    bubbles: boolean;
    target: any;
    currentTarget: any;
    eventPhase: number;
    propagationStopped: boolean;
    propagationImmediateStopped: boolean;
    timeStamp: number;

    constructor(type: string, bubbles?: boolean) {
        this.type = type;
        this.bubbles = bubbles ?? true;
        this.target = null;
        this.currentTarget = null;
        this.eventPhase = 0;
        this.propagationStopped = false;
        this.propagationImmediateStopped = false;
        this.timeStamp = Date.now();
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

    getCurrentTarget(): any {
        return this.currentTarget;
    }

    getType(): string {
        return this.type;
    }

    isStopped(): boolean {
        return this.propagationStopped || this.propagationImmediateStopped;
    }
} 