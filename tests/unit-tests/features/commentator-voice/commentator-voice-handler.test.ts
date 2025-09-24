import "reflect-metadata"
import { Container } from "inversify";
import { CommentatorVoiceHandler } from "../../../../assets/scripts/features/commentator-voice/commentator-voice-handler";
import { CommentatorVoiceStore } from "../../../../assets/scripts/features/commentator-voice/commentator-voice-store";


describe("CommentatorVoiceHandler", () => {
    let container: Container;
    let store: jest.Mocked<CommentatorVoiceStore>    

    beforeEach(() => {
        container = new Container();        
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<CommentatorVoiceStore>
        
        container.bind(CommentatorVoiceStore).toConstantValue(store);
        container.bind(CommentatorVoiceHandler).toSelf();
    });

    describe("name", () => {
        it("should have fixed name as commentatorVoice", () => {
            // Arrange
            const handler = container.get(CommentatorVoiceHandler);
            const expected = "commentatorVoice";
            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });
});