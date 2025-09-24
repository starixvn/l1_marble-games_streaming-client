import { TeamNameStore, TeamNameData } from "../../../../assets/scripts/features/team-name/team-name-store";

// Mock the decorators and dependencies
jest.mock("inversify", () => ({
    injectable: () => (target: any) => target,
}));

jest.mock("../../../../assets/scripts/store-decorator", () => ({
    store: () => (target: any) => target,
}));

jest.mock("mobx", () => ({
    makeObservable: jest.fn(),
    observable: {},
    action: {},
}));

describe("TeamNameStore", () => {
    describe("constructor", () => {
        it("should initialize data with default values", () => {
            // Arrange & Act
            const store = new TeamNameStore();

            // Assert
            expect(store.data).toEqual({
                homeTeamName: "",
                awayTeamName: ""
            });
        });
    });

    describe("update", () => {
        it("should update data with TeamNameData", () => {
            // Arrange
            const store = new TeamNameStore();
            const testData: TeamNameData = {
                homeTeamName: "Red Team",
                awayTeamName: "Blue Team"
            };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous TeamNameData", () => {
            // Arrange
            const store = new TeamNameStore();
            const firstData: TeamNameData = {
                homeTeamName: "Team A",
                awayTeamName: "Team B"
            };
            const secondData: TeamNameData = {
                homeTeamName: "Warriors",
                awayTeamName: "Champions"
            };
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toEqual(secondData);
        });
    });
});
