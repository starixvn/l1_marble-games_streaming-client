import { store } from "../../store-decorator";
import mobx from "mobx";

export type GameData = {
    gameId: string;
}

@store("GameStore")
export class GameStore {

    constructor() {
        mobx.makeAutoObservable(this);
    }

    data: GameData = {
        gameId: "",
    }

    update(data: GameData) {
        this.data = data;
    }
}