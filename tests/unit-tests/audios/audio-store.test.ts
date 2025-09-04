import { AudioStore } from "../../../assets/scripts/audios/audio-store";

describe("AudioStore", () => {
  let store: AudioStore;

  beforeEach(() => {
    store = new AudioStore();
  });

  afterEach(() => {
    // keep consistent cleanup intent
  });

  it("should initialize with defaults", () => {
    expect(store.muted).toBe(true);
    expect(store.browserBlocked).toBe(true);
  });

  it("should toggle muted", () => {
    // Act
    store.setMuted(true);
    // Assert
    expect(store.muted).toBe(true);

    // Act
    store.setMuted(false);
    // Assert
    expect(store.muted).toBe(false);
  });

  it("should toggle browserBlocked", () => {
    // Act
    store.setBrowserBlocked(false);
    // Assert
    expect(store.browserBlocked).toBe(false);

    // Act
    store.setBrowserBlocked(true);
    // Assert
    expect(store.browserBlocked).toBe(true);
  });
});
