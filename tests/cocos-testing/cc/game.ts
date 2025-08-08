export class Game {
    static EVENT_HIDE = "EVENT_HIDE";
    static EVENT_SHOW = "EVENT_SHOW";

    on = jest.fn();
    off = jest.fn();

    canvas: HTMLCanvasElement = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        focus: jest.fn(),
    } as any;
}

export const game = new Game();
