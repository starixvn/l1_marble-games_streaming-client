import { Store } from "../../../assets/scripts/store";

describe("Store", () => {
  it("should initialize defaults when no query params", () => {
    // Arrange
    jest.spyOn(window, "location", "get").mockImplementationOnce(
      () =>
        ({
          href: "https://mgstreaming.lumigame.com/",
        } as any)
    );
    // Act
    const store = new Store();
    // Assert
    expect(store.game).toBe("default");
    expect(store.language).toBe("en-US");
    expect(store.operator).toBe("common");
  });

  it("should parse query params for game, language, operator", () => {
    // Arrange
    jest.spyOn(window, "location", "get").mockImplementationOnce(
      () =>
        ({
          href: "https://mgstreaming.lumigame.com/?game=2001&language=ja-JP&operator=common",
          search: "?game=2001&language=ja-JP&operator=common",
        } as any)
    );
    // Act
    const store = new Store();
    // Assert
    expect(store.game).toBe("2001");
    expect(store.language).toBe("ja-JP");
    expect(store.operator).toBe("common");
  });

  it("should compute serverUrl and rewrite localhost domain", () => {
    // Arrange
    jest.spyOn(window, "location", "get").mockImplementationOnce(
      () =>
        ({
          href: "https://localhost:3000/?game=2001",
          search: "?game=2001",
          host: "localhost:3000",
          hostname: "localhost",
        } as any)
    );
    const storeLocal = new Store();
    // Assert
    expect(storeLocal.serverUrl).toBe(
      "https://mgstreaming.lumigame.com/live/2001"
    );
  });
});
