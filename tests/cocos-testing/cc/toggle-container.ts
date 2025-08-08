import { Component } from "./component";
import { Toggle } from "./toggle";

export class ToggleContainer extends Component {
    toggleItems: Toggle[] = [];
    allowSwitchOff: boolean = false;
    checkEvents: any[] = [];

    protected _activeToggles: Toggle[] = [];

    constructor() {
        super();
    }

    activeToggles(): Toggle[] {
        return this._activeToggles;
    }
} 