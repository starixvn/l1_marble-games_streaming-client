import { ReplayHandler } from "../../../../assets/scripts/local-stores/replay/replay-handler";
import { ReplayStore, type ReplayPayload } from "../../../../assets/scripts/local-stores/replay/replay-store";
import { Store } from "../../../../assets/scripts/store";

describe("ReplayHandler", () => {
  describe("fetchEventReplay", () => {
    it("fetches replay and updates ReplayStore", async () => {
      // Arrange
      const handler = new ReplayHandler();
      const replayStore = new ReplayStore();
      const store = new Store();
      store.eventId = "replay.json";
      const updateSpy = jest.spyOn(replayStore, "update");
      (handler as any).replayStore = replayStore;
      (handler as any).store = store;

      const responseBody: ReplayPayload = {
        meta: { fromTime: 100, gameId: "gm" },
        payload: [{ time: 0, payload: { k: { v: 1 } } }],
      };
      globalThis.fetch = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue(responseBody) } as any) as any;

      // Act
      await handler.fetchEventReplay();

      // Assert
      expect(globalThis.fetch).toHaveBeenCalledWith(store.replayUrl);
      expect(updateSpy).toHaveBeenCalledWith(responseBody);
      expect(replayStore.replayData).toEqual(responseBody);
    });
  });

  describe("connect", () => {
    it("triggers fetchEventReplay without awaiting", () => {
      // Arrange
      const handler = new ReplayHandler();
      const spy = jest.spyOn(handler as any, "fetchEventReplay").mockResolvedValue(undefined as any);

      // Act
      handler.connect();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });
});


