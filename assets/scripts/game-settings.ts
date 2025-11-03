const streamingUrl =
  (window as any).envConfig?.streamingUrl ||
  "https://d1aof1lwumql9k.cloudfront.net/marble_tv/";

export const gameSettings = {
  maxReconnectAttempts: 10,
  reconnectDelay: 5000,
  phaseDuration: 45,
  videoDuration: {
    default: 30,
    "2004": 40,
  },
  streamingUrl: streamingUrl,
  introDuration: {
    default: 8,
    "2000": 8,
  },
};
