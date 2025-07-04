function tryToPlayAudio(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      if (audioContext.state === "suspended") {
        audioContext.close();
        resolve(false);
        return;
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);

      setTimeout(() => {
        const canPlay = audioContext.state === "running";
        audioContext.close();
        resolve(canPlay);
      }, 50);
    } catch (error) {
      resolve(false);
    }
  });
}

export async function canPlayAudio(): Promise<boolean> {
  return await tryToPlayAudio();
}

export function initializeAudio(onEnable: () => void = () => {}): void {
  let isEnabled = false;

  const enableAudio = async () => {
    if (isEnabled) {
      return;
    }

    try {
      const canPlay = await tryToPlayAudio();

      if (canPlay) {
        isEnabled = true;

        removeEventListeners();
        onEnable();
      }
    } catch (error) {}
  };

  const removeEventListeners = () => {
    document.removeEventListener("click", enableAudio);
    document.removeEventListener("mousedown", enableAudio);
    document.removeEventListener("touchstart", enableAudio);
    document.removeEventListener("keydown", enableAudio);
  };

  document.addEventListener("click", enableAudio, { once: true });
  document.addEventListener("mousedown", enableAudio, { once: true });
  document.addEventListener("touchstart", enableAudio, { once: true });
  document.addEventListener("keydown", enableAudio, { once: true });
}
