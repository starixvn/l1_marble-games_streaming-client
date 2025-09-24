import { store } from "../../store-decorator";
import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";

export interface TeamNameData {
    homeTeamName: string;
    awayTeamName: string;
}

@injectable()
@store("TeamNameStore")
export class TeamNameStore extends BaseStoreImpl<TeamNameData> {
    data: TeamNameData = {
        homeTeamName: "",
        awayTeamName: "",
    }
}