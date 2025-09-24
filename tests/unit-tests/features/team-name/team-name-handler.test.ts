import "reflect-metadata"
import { Container } from "inversify";
import { TeamNameHandler } from "../../../../assets/scripts/features/team-name/team-name-handler";
import { TeamNameStore } from "../../../../assets/scripts/features/team-name/team-name-store";

describe("TeamNameHandler", () => {
    let container: Container;
    let store: jest.Mocked<TeamNameStore>;

    beforeEach(() => {
        container = new Container();
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<TeamNameStore>;
        
        container.bind(TeamNameStore).toConstantValue(store);
        container.bind(TeamNameHandler).toSelf();
    });

    describe("name", () => {
        it("should have fixed name as teamName", () => {
            // Arrange
            const handler = container.get(TeamNameHandler);
            const expected = "teamName";
            
            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });
});

