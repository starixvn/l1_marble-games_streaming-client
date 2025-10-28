import { inject } from "inversify";
import { GameStore } from "./game-store";

export class GameHandler {
    private _gameStore: GameStore;

    @inject(GameStore)
    set gameStore(gameStore: GameStore) {
        this._gameStore = gameStore;
    }

    openGame(gameId: string) {
        this._gameStore.update({
            gameId,
        });
    }
}