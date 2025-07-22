import mobx from "mobx";

const { makeAutoObservable } = mobx;

export class BettingStore {
  constructor() {
    makeAutoObservable(this);
  }

  label = "PLACE YOUR BET";
}
