import { Font } from "./font";
import { SpriteFrame } from "./sprite";

export class BitmapFont extends Font {
    /**
     * @deprecated since v3.7.0, Useless Code.
     */
    fntDataStr: string = "";
    /**
     * @en [[SpriteFrame]] of the bitmap font.
     * @zh 位图字体所使用的精灵。
     */
    spriteFrame: SpriteFrame | null = null;
    /**
     * @en The font size.
     * @zh 文字尺寸。
     */
    fontSize: number = 0;
    /**
     * @en Font configuration.
     * @zh 字体配置。
     */
    fntConfig: any = null;
    /**
     * @deprecated since v3.7.0, this is an engine private interface that will be removed in the future.
     */
    fontDefDictionary: any = null;

    onLoaded = jest.fn();
}
