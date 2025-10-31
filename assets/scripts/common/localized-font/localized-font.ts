import {
  CCBoolean,
  Component,
  Font,
  Label,
  RichText,
  TTFFont,
  _decorator,
} from "cc";
import * as i18n from "db://i18n/LanguageData";
import { bundleManager } from "../../asset-loader/bundle-manager";

const { ccclass, property } = _decorator;

class LanguageFont {
  language = "";
  name: "";
  loadRemote: false;
}

@ccclass("LocalizedFont")
export class LocalizedFont extends Component {
  @property({ type: LanguageFont })
  overrideFonts: LanguageFont[] = [];

  @property(CCBoolean)
  enableCacheMode = false;

  label: Label = null;
  richText: RichText = null;
  fontBases = {};

  onLoad() {
    this.initData();
    this.label = this.node.getComponent(Label);
    this.richText = this.node.getComponent(RichText);
    this.updateFont();
  }

  initData() {
    const notoRegular = "noto-serif-regular";
    this.fontBases = {
      "vi-VN": notoRegular,
      "id-ID": notoRegular,
      "en-US": notoRegular,
      "th-TH": "noto-serif-regular-thai",
      "zh-CN": "noto-serif-regular-zhcn",
      "zh-TW": "noto-serif-regular-zhtw",
    };
  }

  getI18nLanguage() {
    return i18n._language;
  }

  updateFont() {
    const { name, loadRemote } = this.getFontNameByLanguage();
    if (this.label) {
      this.loadFont(name, loadRemote)
        .then((font) => {
          if (this.label?.isValid) {
            this.label.font = font;
            this.enableCacheMode && this.handleCacheMode();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
    if (this.richText) {
      this.loadFont(name, loadRemote)
        .then((font) => {
          if (this.richText?.isValid) {
            this.richText.font = font as TTFFont;
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  handleCacheMode() {
    const lang = this.getI18nLanguage();
    switch (lang) {
      case "th-TH":
      case "zh-CN":
      case "zh-TW":
        this.label.cacheMode = Label.CacheMode.BITMAP;
        break;

      default:
        this.label.cacheMode = Label.CacheMode.CHAR;
        break;
    }
  }

  getFontNameByLanguage(): any {
    const lang = this.getI18nLanguage();
    const overrideFonts = this.overrideFonts.find(
      (data) => data.language === lang
    );
    const overrideFont =
      overrideFonts === undefined ? this.fontBases[lang] : overrideFonts;
    return overrideFont || this.fontBases["en"];
  }

  loadFont(name: string, loadRemote: boolean) {
    return bundleManager.loadSharedAsset<Font>(`fonts/${name}`, Font);
  }
}
