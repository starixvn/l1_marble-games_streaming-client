import "reflect-metadata"
import { Container } from "inversify";
import { CurrentEventHandler } from "../../../../assets/scripts/features/current-event/current-event-handler";
import { CurrentEventStore } from "../../../../assets/scripts/features/current-event/current-event-store";

describe("CurrentEventHandler", () => {
    let container: Container;
    let store: jest.Mocked<CurrentEventStore>;

    beforeEach(() => {
        container = new Container();
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<CurrentEventStore>;
        
        container.bind(CurrentEventStore).toConstantValue(store);
        container.bind(CurrentEventHandler).toSelf();
    });

    describe("name", () => {
        it("should have fixed name as currentEvent", () => {
            // Arrange
            const handler = container.get(CurrentEventHandler);
            const expected = "currentEvent";
            
            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });
});

