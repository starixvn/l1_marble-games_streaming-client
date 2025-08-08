import { Component } from "./component";
import { EventTouch } from "./event-touch";
import { Node } from "./node";
import { EventHandler } from "./event-handler";

export enum ButtonEventType {
    CLICK = 'click',
    PRESSED = 'pressed',
    RELEASED = 'released',
}

export enum Transition {
    NONE = 0,
    COLOR = 1,
    SPRITE = 2,
    SCALE = 3,
}

export class Button extends Component {
    static EventType = ButtonEventType;
    static Transition = Transition;

    target: Node | null = null;
    interactable: boolean = true;
    transition = Transition.NONE;
    normalColor = { r: 255, g: 255, b: 255, a: 255 };
    pressedColor = { r: 211, g: 211, b: 211, a: 255 };
    hoverColor = { r: 211, g: 211, b: 211, a: 255 };
    disabledColor = { r: 124, g: 124, b: 124, a: 255 };
    normalSprite: any = null;
    pressedSprite: any = null;
    hoverSprite: any = null;
    disabledSprite: any = null;
    duration: number = 0.1;
    zoomScale: number = 1.2;
    clickEvents: EventHandler[] = [];
    
    // Protected properties
    protected _pressed: boolean = false;
    protected _hovered: boolean = false;
    protected _fromColor = { r: 255, g: 255, b: 255, a: 255 };
    protected _toColor = { r: 255, g: 255, b: 255, a: 255 };
    protected _time: number = 0;
    protected _transitionFinished: boolean = true;
    protected _sprite: any = null;
    protected _originalScale: number = 1;

    constructor() {
        super();
    }

    _onTouchBegan = jest.fn();
    _onTouchMove = jest.fn();
    _onTouchEnd = jest.fn();
    _onTouchCancel = jest.fn();
}
