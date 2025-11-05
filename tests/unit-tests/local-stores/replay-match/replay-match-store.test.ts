import {
  ReplayMatchStore,
  type ReplayMatchPayload,
} from "../../../../assets/scripts/local-stores/replay-match/replay-match-store";

describe("ReplayStore", () => {
  describe("update", () => {
    it("sets replayData to provided payload", () => {
      // Arrange
      const store = new ReplayMatchStore();
      const payload: ReplayMatchPayload = {
        meta: { fromTime: 10, gameId: "g1" },
        payload: [
          {
            time: 0,
            payload: {
              intro: { status: true, currentTime: 0, timeToPlay: 10 },
            },
          },
          { time: 1, payload: { other: { x: 1 } } },
        ],
      };

      // Act
      store.update(payload);

      // Assert
      expect(store.replayData).toEqual(payload);
    });
  });
});
