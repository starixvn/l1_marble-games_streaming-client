import { Button, ButtonEventType, Transition } from "./button";
import { Sprite } from "./sprite";
import { EventHandler } from "./event-handler";
import { ToggleContainer } from "./toggle-container";

export enum ToggleEventType {
    TOGGLE = 'toggle',
}

export class Toggle extends Button {
    static EventType = {
        ...ButtonEventType,
        TOGGLE: ToggleEventType.TOGGLE,
    };

    protected _isChecked: boolean = false;
    protected _checkMark: Sprite | null = null;
    protected _originalScale: number = 1;
    protected _sprite: Sprite | null = null;

    // Public properties
    checkEvents: EventHandler[] = [];
    isCheckedWithoutNotify: boolean = false;
    
    // Additional Button properties
    transition = Transition.NONE;
    normalColor = { r: 255, g: 255, b: 255, a: 255 };
    pressedColor = { r: 211, g: 211, b: 211, a: 255 };
    hoverColor = { r: 211, g: 211, b: 211, a: 255 };
    disabledColor = { r: 124, g: 124, b: 124, a: 255 };
    duration = 0.1;
    zoomScale = 1.2;
    normalSprite: Sprite | null = null;
    pressedSprite: Sprite | null = null;
    hoverSprite: Sprite | null = null;
    disabledSprite: Sprite | null = null;
    interactable = true;
    enableAutoGrayEffect = false;

    constructor() {
        super();
    }

    get isChecked(): boolean {
        return this._isChecked;
    }

    set isChecked(value: boolean) {
        this._set(value, true);
    }

    get checkMark(): Sprite | null {
        return this._checkMark;
    }

    set checkMark(value: Sprite | null) {
        this._checkMark = value;
    }

    set _resizeToTarget(value: boolean) {
        // Deprecated
    }

    get _toggleContainer(): ToggleContainer | null {
        return null;
    }

    protected _internalToggle = jest.fn();

    protected _set(value: boolean, emitEvent: boolean = true) {
        this._isChecked = value;
        if (emitEvent) {
            this._emitToggleEvents();
        }
    }

    playEffect = jest.fn();

    setIsCheckedWithoutNotify(value: boolean) {
        this._set(value, false);
    }

    onEnable = jest.fn();
    onDisable = jest.fn();
    onDestroy = jest.fn();
    onLoad = jest.fn();
    start = jest.fn();
    update = jest.fn();
    lateUpdate = jest.fn();

    protected _emitToggleEvents = jest.fn();
    protected _updateCheckMark = jest.fn();
    protected _updateDisabledState = jest.fn();
    protected _applyTarget = jest.fn();
    protected _registerToggleEvent = jest.fn();
    protected _unregisterToggleEvent = jest.fn();
    
    // Touch event handlers
    _onTouchBegan = jest.fn();
    _onTouchMove = jest.fn();
    _onTouchEnd = jest.fn();
    _onTouchCancel = jest.fn();
    _onTouchEndOrCancel = jest.fn();
}
