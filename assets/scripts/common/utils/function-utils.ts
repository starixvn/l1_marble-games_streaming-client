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

  export function calculateWaitingTimeMilliseconds(
    currentStateTimeMilliseconds: number,
    delayMilliseconds: number
  ): number {
    const currentIntroTimeMilliseconds =
      currentStateTimeMilliseconds - delayMilliseconds;
    return currentIntroTimeMilliseconds < 0
      ? Math.abs(currentIntroTimeMilliseconds)
      : 0;
  }

  export function msToSeconds(milliseconds: number): number {
    return milliseconds / 1000;
  }
}
