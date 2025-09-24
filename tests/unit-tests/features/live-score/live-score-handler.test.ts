import "reflect-metadata"
import { Container } from "inversify";
import { LiveScoreHandler } from "../../../../assets/scripts/features/live-score/live-score-handler";
import { LiveScoreStore } from "../../../../assets/scripts/features/live-score/live-score-store";

describe("LiveScoreHandler", () => {
    let container: Container;
    let store: jest.Mocked<LiveScoreStore>;

    beforeEach(() => {
        container = new Container();
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<LiveScoreStore>;
        
        container.bind(LiveScoreStore).toConstantValue(store);
        container.bind(LiveScoreHandler).toSelf();
    });

    describe("name", () => {
        it("should have fixed name as liveScore", () => {
            // Arrange
            const handler = container.get(LiveScoreHandler);
            const expected = "liveScore";
            
            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });
});

