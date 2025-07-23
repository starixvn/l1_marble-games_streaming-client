import mobx from "mobx";
import { injectable } from "inversify";

const { makeAutoObservable } = mobx;

@injectable()
export class BettingStore {
  constructor() {
    makeAutoObservable(this);
  }

  label = "PLACE YOUR BET";
}
