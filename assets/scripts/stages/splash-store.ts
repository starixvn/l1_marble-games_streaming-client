import mobx from "mobx";

const { makeAutoObservable } = mobx;

export class SplashStore {
  constructor() {
    makeAutoObservable(this);
  }

  label = "Loading...";
}
