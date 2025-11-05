jest.mock("observer", () =>
  require("../../../utils/mock-store").createMockObserver()
);

import { ReplayMatch } from "../../../../assets/scripts/components/replay-match/replay-match";
import { FeatureHandler } from "../../../../assets/scripts/feature-handler/feature-handler";
import { GameHandler } from "../../../../assets/scripts/local-stores/game/game-handler";
import {
  ReplayMatchPayload,
  ReplayMatchStore,
} from "../../../../assets/scripts/local-stores/replay-match/replay-match-store";
import {
  cleanupMockObserver,
  createMockStore,
  initializeMockContainer,
  mockContainer,
} from "../../../utils/mock-store";

describe("ReplayMatch", () => {
  let comp: ReplayMatch;

  beforeAll(() => {
    // Arrange
    initializeMockContainer();
  });

  afterAll(() => {
    cleanupMockObserver();
  });

  beforeEach(() => {
    // Arrange
    jest.restoreAllMocks();
  });

  describe("ReplayStore render replay data", () => {
    it("opens game and dispatches intercepted events", () => {
      // Arrange
      const nowSpy = jest.spyOn(Date, "now").mockReturnValue(5000);
      const featureHandlerMock: Pick<FeatureHandler, "update"> = {
        update: jest.fn(),
      } as any;
      const gameHandlerMock: Pick<GameHandler, "openGame"> = {
        openGame: jest.fn(),
      } as any;
      mockContainer.set(FeatureHandler as any, featureHandlerMock as any);
      mockContainer.set(GameHandler as any, gameHandlerMock as any);

      const replayData: ReplayMatchPayload = {
        meta: { fromTime: 1000, gameId: "gm-1" },
        payload: [
          {
            time: 0,
            payload: {
              intro: { status: true, currentTime: 0, timeToPlay: 1500 },
            },
          },
          {
            time: 1,
            payload: {
              videoStreaming: {
                videoLink: "v",
                currentTime: 20,
                timeToStream: 2000,
              },
            },
          },
          { time: 2, payload: { other: { a: 1 } } },
        ],
      };
      const replayStore = createMockStore<ReplayMatchStore>(ReplayMatchStore, {
        replayData: null,
      } as Partial<ReplayMatchStore>);

      const scheduled: Array<{ fn: () => void; delay: number }> = [];
      const expectedDelays = [0, 1, 2];
      const expectedIntro = {
        intro: { status: true, currentTime: 0, timeToPlay: 5500 },
      };
      const expectedStreaming = {
        videoStreaming: { videoLink: "v", currentTime: 20, timeToStream: 6000 },
      };
      const expectedOther = { other: { a: 1 } };
      // Act
      comp = new ReplayMatch();
      const scheduleSpy = jest
        .spyOn(
          comp as unknown as {
            scheduleOnce: (cb: () => void, delay: number) => void;
          },
          "scheduleOnce"
        )
        .mockImplementation((fn: () => void, delay: number) => {
          scheduled.push({ fn, delay });
        });
      replayStore.update({ replayData } as Partial<ReplayMatchStore>);

      // Assert
      expect(gameHandlerMock.openGame).toHaveBeenCalledWith("gm-1");
      expect(scheduled.map((s) => s.delay)).toEqual(expectedDelays);
      // Execute scheduled callbacks to drive @handle
      scheduleSpy.mock.calls.forEach((call) => (call[0] as () => void)());
      expect(featureHandlerMock.update).toHaveBeenCalledTimes(3);
      expect(featureHandlerMock.update).toHaveBeenCalledWith(expectedIntro);
      expect(featureHandlerMock.update).toHaveBeenCalledWith(expectedStreaming);
      expect(featureHandlerMock.update).toHaveBeenCalledWith(expectedOther);

      nowSpy.mockRestore();
    });
  });

  describe("handle FeatureHandler replay event", () => {
    it("calls update with provided payload", () => {
      // Arrange
      const fhMock: Pick<FeatureHandler, "update"> = {
        update: jest.fn(),
      } as any;
      mockContainer.set(FeatureHandler as any, fhMock as any);
      comp = new ReplayMatch();
      const payload = { k: { x: 1 } } as Record<string, object>;

      // Act
      comp.replayEvent(payload);

      // Assert
      expect(fhMock.update).toHaveBeenCalledWith(payload);
    });
  });

  describe("handle GameHandler open game", () => {
    it("forwards gameId to handler", () => {
      // Arrange
      const ghMock: Pick<GameHandler, "openGame"> = {
        openGame: jest.fn(),
      } as any;
      mockContainer.set(GameHandler as any, ghMock as any);
      comp = new ReplayMatch();

      // Act
      comp.openGame("gm-x");

      // Assert
      expect(ghMock.openGame).toHaveBeenCalledWith("gm-x");
    });
  });
});
