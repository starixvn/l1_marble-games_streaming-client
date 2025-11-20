import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";
import { store } from "../../store-decorator";

export interface IntroData {
  prebet: string;
  halftime: string;
}

@injectable()
@store("IntroStore")
export class IntroStore extends BaseStoreImpl<IntroData> {
  data: IntroData = {
    prebet: "",
    halftime: "",
  };
}
