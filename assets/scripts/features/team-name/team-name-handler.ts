import { inject } from "inversify";
import { TeamNameData, TeamNameStore } from "./team-name-store";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";


@featureHandler
export class TeamNameHandler extends BaseHandlerImpl<TeamNameData> {
    name = "teamName";

    @inject(TeamNameStore) 
    set store(store: TeamNameStore) {
        this._store = store;
    }
}

