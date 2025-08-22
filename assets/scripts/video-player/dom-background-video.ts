export interface VideoConfigOption {
  zIndex?: number;
  muted?: boolean;
  hidden?: boolean;
}

enum HTMLZIndex {
  GAME = "11",
  VIDEO = "10",
  HIDDEN = "9"
}

export enum GenericBackgroundVideoEvents {
  SWITCH_BACKGROUND = "SwitchBackground",
}

export class DOMBackgroundVideo {
  static readonly GAME_CONTAINER_ID = "Cocos3dGameContainer";
  static readonly GAME_CANVAS_ID = "GameCanvas";

  static readonly VIDEO_ID = "VideoBackground";

  static readonly resizeCallbacks = new Map<string, () => void>();

  static readonly videos = new Map<string, HTMLVideoElement>();

  static readonly genericEventNotifier = new EventTarget();

  static resizeObserver: ResizeObserver = new ResizeObserver(() => {
    DOMBackgroundVideo.resizeCallbacks.forEach((callback) => callback());
  });

  static changeBackground(videoId: string, url: string) {
    console.log("changing background", videoId, url);
    const video = DOMBackgroundVideo.videos.get(videoId);
    video.style.background = `url(${url}) center/cover no-repeat`;
    video.style.backgroundSize = "100% 100%";
  }
  
  static notify(event: GenericBackgroundVideoEvents, data: any) {
    console.log("notifying", event, data);
    DOMBackgroundVideo.genericEventNotifier.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  static toFront(id: string) {
    const video = DOMBackgroundVideo.videos.get(id);
    if (video) {
      video.style.zIndex = HTMLZIndex.VIDEO;

      for (const [currentId, currentVideo] of DOMBackgroundVideo.videos) {
        if (currentId !== id) {
          currentVideo.style.zIndex = HTMLZIndex.HIDDEN;
        }
      }
    }
  }

  static applyConfig(id: string, config: VideoConfigOption) {
    const video = DOMBackgroundVideo.videos.get(id);
    if (video) {
      video.style.zIndex = config.zIndex?.toString() ?? HTMLZIndex.VIDEO;
      video.muted = config.muted ?? false;
      video.style.visibility = config.hidden ?? false ? "hidden" : "visible";
    }
  }

  static createOrLoadVideoElement(id: string = DOMBackgroundVideo.VIDEO_ID): HTMLVideoElement {
    const container = document.getElementById(
      DOMBackgroundVideo.GAME_CONTAINER_ID,
    );
    const game = document.getElementById(DOMBackgroundVideo.GAME_CANVAS_ID);
    const video = DOMBackgroundVideo.videos.get(id);

    if (game) {
      DOMBackgroundVideo.applyGameStyles(game);
    }

    if (!video) {
      const video = document.createElement("video");
      const size = container.getBoundingClientRect();

      video.id = id;
      video.muted = true;

      DOMBackgroundVideo.applyVideoStyles(video, size);

      container.insertBefore(video, container.firstChild);

      DOMBackgroundVideo.resizeCallbacks.set(id, () => {
        DOMBackgroundVideo.onResize(id);
      });

      if (DOMBackgroundVideo.videos.size === 0) {
        DOMBackgroundVideo.registerEvents();
      }

      DOMBackgroundVideo.videos.set(id, video);


      return video;
    }

    return video;
  }

  static removeVideoElement(id = "VideoBackground") {
    const video = DOMBackgroundVideo.videos.get(id);

    if (video) {
      video.remove();
      DOMBackgroundVideo.resizeCallbacks.delete(id);
      DOMBackgroundVideo.videos.delete(id);
      if (DOMBackgroundVideo.videos.size === 0) {
        DOMBackgroundVideo.unregisterEvents();
      }
    }
  }

  private static applyVideoStyles(video: HTMLVideoElement, size: DOMRect) {
    const isPortrait = size.width < size.height;

    video.style.position = "absolute";
    video.style.bottom = "0px";
    video.style.left = "0px";
    video.style.width = `${isPortrait ? size.height : size.width}px`;
    video.style.height = `${isPortrait ? size.width : size.height}px`;
    video.width = size.width;
    video.height = size.height;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "auto";
    video.style.zIndex = HTMLZIndex.HIDDEN;
  }

  private static applyGameStyles(game: HTMLElement) {
    game.style.zIndex = HTMLZIndex.GAME;
    game.style.position = "relative";
  }

  private static onResize(id: string = DOMBackgroundVideo.VIDEO_ID) {
    const container = document.getElementById(
      DOMBackgroundVideo.GAME_CONTAINER_ID,
    );
    const size = container.getBoundingClientRect();
    const video = DOMBackgroundVideo.createOrLoadVideoElement(id);

    DOMBackgroundVideo.applyVideoStyles(video, size);
  }

  private static registerEvents() {
    const container = document.getElementById(
      DOMBackgroundVideo.GAME_CONTAINER_ID,
    );

    DOMBackgroundVideo.resizeObserver.observe(container);
  }

  private static unregisterEvents() {
    DOMBackgroundVideo.resizeObserver.disconnect();
  }
}
