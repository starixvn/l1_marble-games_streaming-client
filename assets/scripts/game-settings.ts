const streamingUrl = ((window as any).envConfig)?.streamingUrl || "https://d1aof1lwumql9k.cloudfront.net/marble_tv/";

export const gameSettings = {
  maxReconnectAttempts: 10,
  reconnectDelay: 5000,
  halfDuration: 45,
  videoDuration: 30,
  streamingUrl: streamingUrl,
  introDuration: {
    "default": 8,
    "2000": 8,
  }
};
