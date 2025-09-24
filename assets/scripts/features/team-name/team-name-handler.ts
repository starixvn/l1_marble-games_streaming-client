import { inject, injectable } from "inversify";
import { TeamNameData, TeamNameStore } from "./team-name-store";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";


@injectable()
@featureHandler
export class TeamNameHandler extends BaseHandlerImpl<TeamNameData> {
    name = "teamName";

    @inject(TeamNameStore) 
    readonly store: TeamNameStore
}

