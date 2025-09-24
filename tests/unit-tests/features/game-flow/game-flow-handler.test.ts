import "reflect-metadata"
import { Container } from "inversify";
import { GameFlowHandler } from "../../../../assets/scripts/features/game-flow/game-flow-handler";
import { GameFlowStore } from "../../../../assets/scripts/features/game-flow/game-flow-store";

describe("GameFlowHandler", () => {
    let container: Container;
    let store: jest.Mocked<GameFlowStore>;

    beforeEach(() => {
        container = new Container();
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<GameFlowStore>;
        
        container.bind(GameFlowStore).toConstantValue(store);
        container.bind(GameFlowHandler).toSelf();
    });

    describe("name", () => {
        it("should have fixed name as gameFlow", () => {
            // Arrange
            const handler = container.get(GameFlowHandler);
            const expected = "gameFlow";
            
            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });
});

