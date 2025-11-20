import {
  IntroStore,
  IntroData,
} from "../../../../assets/scripts/features/intro/intro-store";

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

describe("IntroStore", () => {
  describe("constructor", () => {
    it("should initialize data with default values", () => {
      // Arrange & Act
      const store = new IntroStore();

      // Assert
      expect(store.data).toEqual({
        prebet: "",
        halftime: "",
      });
    });
  });

  describe("update", () => {
    it("should update data with IntroData", () => {
      // Arrange
      const store = new IntroStore();
      const testData: IntroData = {
        prebet: "https://cdn.example.com/prebet-intro.mp4",
        halftime: "https://cdn.example.com/halftime-intro.mp4",
      };

      // Act
      store.update(testData);

      // Assert
      expect(store.data).toEqual(testData);
    });

    it("should overwrite previous IntroData", () => {
      // Arrange
      const store = new IntroStore();
      const firstData: IntroData = {
        prebet: "https://old-server.com/prebet.mp4",
        halftime: "https://old-server.com/halftime.mp4",
      };
      const secondData: IntroData = {
        prebet: "https://new-server.com/prebet.mp4",
        halftime: "https://new-server.com/halftime.mp4",
      };
      store.data = firstData;

      // Act
      store.update(secondData);

      // Assert
      expect(store.data).toEqual(secondData);
    });
  });
});
