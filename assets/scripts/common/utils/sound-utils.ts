export namespace SoundUtils {
  export function getCommentPath(): string {
    return "audios/common/";
  }

  export function getAudioGamePath(gameId: string): string {
    return `audios/${gameId}/`;
  }
}
