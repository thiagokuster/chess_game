// Web Audio API pure synthesizer for premium chess game sound effects

class SoundService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainValue = 0.1, delay = 0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Soft click for legal normal move
  public move() {
    this.playTone(350, 'triangle', 0.08, 0.15);
    this.playTone(700, 'sine', 0.05, 0.08, 0.01);
  }

  // Sharper snap for capturing a piece
  public capture() {
    this.playTone(600, 'square', 0.08, 0.12);
    this.playTone(900, 'triangle', 0.05, 0.18, 0.01);
    this.playTone(1200, 'sine', 0.08, 0.1, 0.02);
  }

  // Castling whoosh
  public castle() {
    this.playTone(400, 'sine', 0.1, 0.15);
    this.playTone(550, 'triangle', 0.1, 0.15, 0.06);
  }

  // Urgent double tone for Check
  public check() {
    this.playTone(880, 'triangle', 0.12, 0.25);
    this.playTone(1760, 'sine', 0.15, 0.2, 0.08);
  }

  // Promotion
  public promote() {
    this.playTone(523.25, 'triangle', 0.1, 0.2);
    this.playTone(659.25, 'triangle', 0.1, 0.2, 0.08);
    this.playTone(783.99, 'sine', 0.15, 0.2, 0.16);
    this.playTone(1046.50, 'sine', 0.25, 0.25, 0.24);
  }

  // Triumphant arpeggio for victory
  public victory() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.3, 0.2, idx * 0.12);
    });
  }

  // Sad descending tones for defeat
  public defeat() {
    const notes = [466.16, 415.30, 369.99, 329.63]; // Bb4, Ab4, F#4, E4
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sawtooth', 0.35, 0.15, idx * 0.18);
    });
  }

  // Notification sound for chat or game start
  public notify() {
    this.playTone(587.33, 'sine', 0.1, 0.15);
    this.playTone(880, 'sine', 0.15, 0.15, 0.08);
  }

  // Draw
  public draw() {
    this.playTone(440, 'sine', 0.2, 0.15);
    this.playTone(440, 'triangle', 0.2, 0.15, 0.18);
  }
}

export const sound = new SoundService();
