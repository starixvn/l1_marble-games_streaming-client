import { _decorator } from "cc";
import { FontMapping, LocalizedFont } from "./localized-font";

const { ccclass } = _decorator;

@ccclass("LocalizedFontBold")
export default class LocalizedFontBold extends LocalizedFont {
    initData() {
        const notoBold = "noto-serif-bold";
        this.fontBases = {
            vi: {
                name: notoBold,
                loadRemote: false,
            },
            id: {
                name: notoBold,
                loadRemote: false,
            },
            en: {
                name: notoBold,
                loadRemote: false,
            },
            th: {
                name: "noto-serif-bold-thai",
                loadRemote: false,
            },
            zh_tw: {
                name: "noto-serif-bold-zhtw",
                loadRemote: false,
            },
            zh_cn: {
                name: "noto-serif-bold-zhcn",
                loadRemote: false,
            },
            ...globalThis?.fontMapping?.bold,
        } as FontMapping;
    }
}
