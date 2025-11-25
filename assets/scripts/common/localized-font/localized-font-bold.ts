import { _decorator } from "cc";
import { LocalizedFont } from "./localized-font";

const { ccclass } = _decorator;

@ccclass("LocalizedFontBold")
export default class LocalizedFontBold extends LocalizedFont {
  initData() {
    const notoBold = "noto-serif-bold";
    this.fontBases = {
      "vi-VN": notoBold,
      "id-ID": notoBold,
      "en-US": notoBold,
      "th-TH": "noto-serif-bold-thai",
      "zh-CN": "noto-serif-bold-zhcn",
      "zh-TW": "noto-serif-bold-zhtw",
    };
  }
}
