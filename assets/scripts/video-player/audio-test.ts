import { _decorator, Component } from "cc";
import { BackgroundVideoSoundControl } from "./background-video-sound-control";

const { ccclass } = _decorator;

@ccclass("AudioTest")
export class AudioTest extends Component {
  async start() {
    console.log("Testing browser audio capabilities...");

    try {
      const capabilities =
        await BackgroundVideoSoundControl.getAudioCapabilities();

      console.log("=== Audio Capabilities Report ===");
      console.log("Can play audio:", capabilities.canPlayAudio);
      console.log(
        "Can autoplay with sound:",
        capabilities.canAutoplayWithSound,
      );
      console.log("User Agent:", capabilities.userAgent);
      console.log("Is Mobile:", capabilities.isMobile);
      console.log("Is iOS:", capabilities.isIOS);
      console.log("Is Android:", capabilities.isAndroid);

      // Provide recommendations based on capabilities
      if (!capabilities.canPlayAudio) {
        console.warn("⚠️ This browser does not support audio playback");
      }

      if (!capabilities.canAutoplayWithSound) {
        console.warn(
          "⚠️ Autoplay with sound is not allowed. User interaction required to enable sound.",
        );
        console.log(
          "💡 Recommendation: Start videos muted and provide a 'Click to Enable Sound' button",
        );
      }

      if (capabilities.isMobile) {
        console.log(
          "📱 Mobile device detected - audio behavior may be different",
        );
      }

      if (capabilities.isIOS) {
        console.log(
          "🍎 iOS device detected - special audio considerations apply",
        );
        console.log("💡 iOS requires user interaction before playing audio");
      }
    } catch (error) {
      console.error("Error testing audio capabilities:", error);
    }
  }

  /**
   * Test individual audio capability methods
   */
  async testIndividualCapabilities() {
    console.log("Testing individual capabilities...");

    const canPlayAudio = await BackgroundVideoSoundControl.canPlayAudio();
    console.log("Can play audio:", canPlayAudio);

    const canAutoplay =
      await BackgroundVideoSoundControl.canAutoplayWithSound();
    console.log("Can autoplay with sound:", canAutoplay);
  }

  /**
   * Example of how to handle audio based on capabilities
   */
  async handleAudioBasedOnCapabilities() {
    const capabilities =
      await BackgroundVideoSoundControl.getAudioCapabilities();

    if (!capabilities.canPlayAudio) {
      // Disable all audio features
      console.log("Audio disabled - browser doesn't support it");
      return;
    }

    if (!capabilities.canAutoplayWithSound) {
      // Start muted and wait for user interaction
      console.log("Starting muted - waiting for user interaction");
      // You would typically set your video player to muted here
      // and show a "Click to Enable Sound" button
    } else {
      // Can play audio immediately
      console.log("Audio can be played immediately");
    }
  }
}
