import "reflect-metadata"
import { Container } from "inversify";
import { IntroHandler } from "../../../../assets/scripts/features/intro/intro-handler";
import { IntroStore, IntroData } from "../../../../assets/scripts/features/intro/intro-store";

describe("IntroHandler", () => {
    let container: Container;
    let store: jest.Mocked<IntroStore>;
    const FIXED_DATE_NOW = 15000; // Fixed timestamp for predictable tests

    beforeEach(() => {
        // Mock Date.now() to return fixed value
        jest.spyOn(Date, 'now').mockReturnValue(FIXED_DATE_NOW);
        
        container = new Container();
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<IntroStore>;
        
        container.bind(IntroStore).toConstantValue(store);
        container.bind(IntroHandler).toSelf();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("name", () => {
        it("should have fixed name as intro", () => {
            // Arrange
            const handler = container.get(IntroHandler);
            const expected = "intro";
            
            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });

    describe("update", () => {
        it("should call store.update with calculated introTime and isPlaying", () => {
            // Arrange
            const handler = container.get(IntroHandler);
            const testData: IntroData = {
                resourceServer: "https://cdn.example.com",
                introTime: 0, // This will be overridden
                timeToPlay: 5000,
                isPlaying: false, // This will be overridden
                duration: 30000
            };
            const expectedIntroTime = (FIXED_DATE_NOW - testData.timeToPlay) / 1000; // (15000 - 5000) / 1000 = 10
            const expectedIsPlaying = expectedIntroTime <= testData.duration; // 10 <= 30000 = true

            // Act
            handler.update(testData);

            // Assert
            expect(store.update).toHaveBeenCalledWith({
                ...testData,
                introTime: expectedIntroTime,
                isPlaying: expectedIsPlaying
            });
        });
    });
});

