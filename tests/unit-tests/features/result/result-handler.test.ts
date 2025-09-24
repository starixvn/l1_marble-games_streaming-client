import "reflect-metadata"
import { Container } from "inversify";
import { ResultHandler } from "../../../../assets/scripts/features/result/result-handler";
import { ResultStore, ResultData } from "../../../../assets/scripts/features/result/result-store";

describe("ResultHandler", () => {
    let container: Container;
    let store: jest.Mocked<ResultStore>;

    beforeEach(() => {
        container = new Container();
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<ResultStore>;
        
        container.bind(ResultStore).toConstantValue(store);
        container.bind(ResultHandler).toSelf();
    });

    describe("name", () => {
        it("should have fixed name as result", () => {
            // Arrange
            const handler = container.get(ResultHandler);
            const expected = "result";
            
            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });

    describe("update", () => {
        it("should call store.update with provided data", () => {
            // Arrange
            const handler = container.get(ResultHandler);
            const testData: ResultData = {
                result: {
                    1: { homeScore: 2, awayScore: 1 }
                }
            };

            // Act
            handler.update(testData);

            // Assert
            expect(store.update).toHaveBeenCalledWith(testData);
        });
    });
});

