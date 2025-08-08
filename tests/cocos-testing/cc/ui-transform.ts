import * as math from "./math";
import { Node } from "./node";

export class UITransform {
    width = 0;

    height = 0;
    private _contentSize: math.Size = new math.Size(0, 0);

    convertToNodeSpaceAR = jest.fn();

    getBoundingBox = jest.fn();

    convertToWorldSpaceAR = jest.fn();
    
    setContentSize = jest.fn().mockImplementation((width: number, height: number) => {
        this._contentSize = new math.Size(width, height);
        this.width = width;
        this.height = height;
    });

    get contentSize(): Readonly<math.Size> {
        const size = new math.Size(this._contentSize.width, this._contentSize.height);
        return Object.freeze(size);
    }

    set contentSize(value: math.Size | { width: number; height: number }) {
        this._contentSize = new math.Size(value.width, value.height);

        this.width = value.width;
        this.height = value.height;
    }

    hitTest = jest.fn();
    node = new Node();
}
