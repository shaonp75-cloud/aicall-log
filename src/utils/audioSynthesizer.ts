/**
 * Real HTML5 Audio Service that streams and plays audio directly from recording URLs.
 */

type TimeUpdateCallback = (currentTime: number, duration: number) => void;
type EndedCallback = () => void;
type ErrorCallback = (error: string) => void;

class RealAudioPlayerService {
  private audioElement: HTMLAudioElement | null = null;
  private currentOrderId: string | null = null;
  private currentUrl: string | null = null;
  private isPlaying: boolean = false;
  private duration: number = 0;
  private currentTime: number = 0;
  private playbackRate: number = 1.0;
  private onTimeUpdate: TimeUpdateCallback | null = null;
  private onEnded: EndedCallback | null = null;
  private onError: ErrorCallback | null = null;

  public playUrl(
    orderId: string,
    url: string,
    rate: number = 1.0,
    fallbackDuration: number = 40,
    onTimeUpdate?: TimeUpdateCallback,
    onEnded?: EndedCallback,
    onError?: ErrorCallback
  ) {
    // If same audio is currently playing, pause it
    if (this.currentOrderId === orderId && this.isPlaying && this.audioElement) {
      this.pause();
      return;
    }

    // Stop any existing playback
    this.stop();

    this.currentOrderId = orderId;
    this.currentUrl = url;
    this.playbackRate = rate;
    this.duration = fallbackDuration;
    this.currentTime = 0;
    this.onTimeUpdate = onTimeUpdate || null;
    this.onEnded = onEnded || null;
    this.onError = onError || null;

    const cleanUrl = (url || '').replace(/^[\r\n\s]+|[\r\n\s]+$/g, '').trim();
    this.currentUrl = cleanUrl;

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = cleanUrl;
      audio.playbackRate = this.playbackRate;

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          this.duration = audio.duration;
        }
      });

      audio.addEventListener('timeupdate', () => {
        this.currentTime = audio.currentTime;
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          this.duration = audio.duration;
        }
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.currentTime, this.duration);
        }
      });

      audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.currentTime = 0;
        if (this.onEnded) {
          this.onEnded();
        }
      });

      audio.addEventListener('error', (e) => {
        console.warn('Audio playback error on URL:', url, e);
        // If error (e.g. CORS or invalid header), report error but keep status clean
        if (this.onError) {
          this.onError('Unable to load audio directly from server.');
        }
      });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
          })
          .catch((err) => {
            console.warn('Audio autoplay / play restricted:', err);
            // Some browsers require explicit user interaction or show play failure
          });
      }

      this.audioElement = audio;
      this.isPlaying = true;
    } catch (err) {
      console.error('Failed to initialize audio element:', err);
    }
  }

  public play(
    orderId: string,
    durationSec: number = 40,
    _textPreview?: string,
    playbackRate: number = 1.0,
    onTimeUpdate?: TimeUpdateCallback,
    onEnded?: EndedCallback
  ) {
    if (this.currentUrl) {
      this.playUrl(orderId, this.currentUrl, playbackRate, durationSec, onTimeUpdate, onEnded);
    } else if (onEnded) {
      onEnded();
    }
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
  }

  public resume() {
    if (this.audioElement) {
      this.audioElement.play().catch(console.warn);
      this.isPlaying = true;
    }
  }

  public seek(seconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = seconds;
      this.currentTime = seconds;
    }
  }

  public setRate(rate: number) {
    this.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  public stop() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
        this.audioElement.load();
      } catch {
        // Safe ignore
      }
      this.audioElement = null;
    }
    this.isPlaying = false;
    this.currentOrderId = null;
    this.currentUrl = null;
    this.currentTime = 0;
  }

  public isCurrent(orderId: string): boolean {
    return this.currentOrderId === orderId && this.isPlaying;
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentOrderId: this.currentOrderId,
      currentTime: this.currentTime,
      duration: this.duration,
      playbackRate: this.playbackRate,
    };
  }
}

export const audioEngine = new RealAudioPlayerService();
