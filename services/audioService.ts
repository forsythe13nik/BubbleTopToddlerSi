
class AudioService {
  private context: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  constructor() {}

  public async resume(): Promise<void> {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  public stopAll(): void {
    this.activeSources.forEach(source => {
      try {
        source.onended = null;
        source.stop();
      } catch (e) {}
    });
    this.activeSources.clear();
    if (this.context) {
      this.nextStartTime = this.context.currentTime;
    }
  }

  public decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  public async decodeAudioData(
    data: Uint8Array,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Promise<AudioBuffer> {
    await this.resume();
    if (!this.context) throw new Error("Audio context not initialized");
    
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = this.context.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  /**
   * Plays a pre-decoded AudioBuffer immediately.
   * Returns a promise that resolves when playback is finished.
   */
  public async playBuffer(buffer: AudioBuffer, queue: boolean = false): Promise<void> {
    await this.resume();
    if (!this.context) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);

    if (queue) {
      this.nextStartTime = Math.max(this.nextStartTime, this.context.currentTime);
      const startTime = this.nextStartTime;
      this.nextStartTime += buffer.duration;
      source.start(startTime);
    } else {
      source.start(0);
    }

    this.activeSources.add(source);

    return new Promise((resolve) => {
      source.onended = () => {
        this.activeSources.delete(source);
        resolve();
      };
    });
  }

  public async playPCM(base64Audio: string): Promise<void> {
    const data = this.decode(base64Audio);
    const buffer = await this.decodeAudioData(data);
    return this.playBuffer(buffer, true);
  }

  public async playCelebrationSound() {
    await this.resume();
    if (!this.context) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }
}

export const audioService = new AudioService();
