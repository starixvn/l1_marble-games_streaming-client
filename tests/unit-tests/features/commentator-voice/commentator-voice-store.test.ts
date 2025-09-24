
import { CommentatorVoiceStore, CommentatorVoiceData } from "../../../../assets/scripts/features/commentator-voice/commentator-voice-store";

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

describe("CommentatorVoiceStore", () => {

    describe("constructor", () => {
        it("should initialize data as null", () => {
            // Arrange & Act
            const store = new CommentatorVoiceStore();

            // Assert
            expect(store.data).toBeNull();
        });
    });

    describe("update", () => {
        it("should update data with CommentatorVoiceData", () => {
            // Arrange
            const store = new CommentatorVoiceStore();
            const testData: CommentatorVoiceData = { fileName: "test-audio.mp3" };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous CommentatorVoiceData", () => {
            // Arrange
            const store = new CommentatorVoiceStore();
            const firstData: CommentatorVoiceData = { fileName: "first-audio.mp3" };
            const secondData: CommentatorVoiceData = { fileName: "second-audio.wav" };
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toEqual(secondData);
        });
    });
});
