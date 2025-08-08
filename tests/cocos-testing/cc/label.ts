import { Color } from "./color";
import { Font } from "./font";
import { Node } from "./node";

export enum Overflow {
    /**
     * @en None.
     *
     * @zh 不做任何限制。
     */
    NONE = 0,
    /**
     * @en In CLAMP mode, when label content goes out of the bounding box, it will be clipped.
     *
     * @zh CLAMP 模式中，当文本内容超出边界框时，多余的会被截断。
     */
    CLAMP = 1,
    /**
     * @en In SHRINK mode, the font size will change dynamically to adapt the content size.
     * This mode may takes up more CPU resources when the label is refreshed.
     *
     * @zh SHRINK 模式，字体大小会动态变化，以适应内容大小。这个模式在文本刷新的时候可能会占用较多 CPU 资源。
     */
    SHRINK = 2,
    /**
     * @en In RESIZE_HEIGHT mode, you can only change the width of label and the height is changed automatically.
     *
     * @zh 在 RESIZE_HEIGHT 模式下，只能更改文本的宽度，高度是自动改变的。
     */
    RESIZE_HEIGHT = 3,
}

export class Label {
    static CacheMode = {
        NONE: 0,
        BITMAP: 1,
        CHAR: 2,
    };

    static get Overflow() {
        return Overflow;
    }

    string = "string";

    node: any = new Node();

    getComponent = jest.fn();

    color = new Color();

    fontSize = 0;
    lineHeight = 0;

    cacheMode = 2;

    overflow = Overflow.NONE;

    private _font: Font | null = null;
    get font(): Font | null {
        return this._font;
    }
    set font(value: Font | null) {
        this._font = value;
    }
}
