import { inject } from "inversify";
import { GameFlowData, GameFlowStore } from "./game-flow-store";
import { BaseHandlerImpl } from "../base/base-handler";
import { featureHandler } from "../../handler-registry";

@featureHandler
export class GameFlowHandler extends BaseHandlerImpl<GameFlowData> {
    name = "gameFlow";
    
    @inject(GameFlowStore) 
    set store(store: GameFlowStore) {
        this._store = store;
    }
}