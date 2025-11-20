import "reflect-metadata";
import { Container } from "inversify";
import { IntroHandler } from "../../../../assets/scripts/features/intro/intro-handler";
import {
  IntroStore,
  IntroData,
} from "../../../../assets/scripts/features/intro/intro-store";

describe("IntroHandler", () => {
  let container: Container;
  let store: jest.Mocked<IntroStore>;

  beforeEach(() => {
    container = new Container();
    store = {
      update: jest.fn(),
    } as unknown as jest.Mocked<IntroStore>;

    container.bind(IntroStore).toConstantValue(store);
    container.bind(IntroHandler).toSelf();
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
    it("should call store.update with intro URLs", () => {
      // Arrange
      const handler = container.get(IntroHandler);
      const testData: IntroData = {
        prebet: "https://cdn.example.com/prebet.m3u8",
        halftime: "https://cdn.example.com/halftime.m3u8",
      };

      // Act
      handler.update(testData);

      // Assert
      expect(store.update).toHaveBeenCalledWith(testData);
    });

    it("should pass through data without modification", () => {
      // Arrange
      const handler = container.get(IntroHandler);
      const testData: IntroData = {
        prebet: "https://example.com/prebet-video.m3u8",
        halftime: "https://example.com/halftime-video.m3u8",
      };

      // Act
      handler.update(testData);

      // Assert
      expect(store.update).toHaveBeenCalledTimes(1);
      expect(store.update).toHaveBeenCalledWith(testData);
    });
  });
});
