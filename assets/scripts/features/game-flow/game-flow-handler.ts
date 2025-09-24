import { inject, injectable } from "inversify";
import { GameFlowData, GameFlowStore } from "./game-flow-store";
import { BaseHandlerImpl } from "../base/base-handler";
import { featureHandler } from "../../handler-registry";

@injectable()
@featureHandler
export class GameFlowHandler extends BaseHandlerImpl<GameFlowData> {
    name = "gameFlow";
    
    @inject(GameFlowStore) 
    readonly store: GameFlowStore;
}