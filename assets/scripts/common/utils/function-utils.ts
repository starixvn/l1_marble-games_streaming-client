import { t } from "db://i18n/LanguageData";

export namespace FunctionUtils {
  export function getLocalizedKey(
    operator: string,
    key: string | undefined | null
  ): string {
    if (key == null || t(key) === "") {
      return `Common.${key}`;
    }

    return `${operator}.${key}`;
  }
}
