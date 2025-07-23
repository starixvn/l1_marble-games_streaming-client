import mobx from "mobx";
import { injectable } from "inversify";

const { makeAutoObservable } = mobx;

@injectable()
export class SplashStore {
  constructor() {
    makeAutoObservable(this);
  }

  label = "Loading...";
}
