import type AgoraRTC from 'agora-rtc-sdk-ng';
import type { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: ILocalAudioTrack | null = null;
  private appId: string;
  private currentChannel: string | null = null;
  private AgoraRTC: typeof AgoraRTC | null = null;

  constructor(appId: string) {
    if (!appId) throw new Error('Agora AppId is required');
    this.appId = appId;
  }

  private async initializeAgoraClient(): Promise<void> {
    if (!this.AgoraRTC) {
      // Importación dinámica de Agora solo en el cliente
      const AgoraRTCModule = await import('agora-rtc-sdk-ng');
      this.AgoraRTC = AgoraRTCModule.default;
    }

    if (!this.client) {
      this.client = this.AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      this.setupClientListeners();
    }
  }

  private setupClientListeners(): void {
    if (!this.client) return;

    this.client.on("connection-state-change", (curState, prevState) => {
      console.log("Connection state changed from", prevState, "to", curState);
    });

    this.client.on("exception", (event) => {
      console.warn("Agora client exception:", event);
    });
  }

  async joinChannel(channelName: string, token: string): Promise<void> {
    if (!channelName || !token) {
      throw new Error('Channel name and token are required');
    }

    try {
      await this.initializeAgoraClient();
      if (!this.client) throw new Error('Failed to initialize Agora client');

      // Si ya estamos en un canal, salimos primero
      if (this.currentChannel) {
        await this.leaveChannel();
      }

      await this.client.join(this.appId, channelName, token, null);
      this.currentChannel = channelName;

      // Crear y publicar el track de audio
      this.localAudioTrack = await this.AgoraRTC!.createMicrophoneAudioTrack();
      await this.client.publish([this.localAudioTrack]);
      
      // Por defecto, el audio está deshabilitado
      this.localAudioTrack.setEnabled(false);
    } catch (error) {
      console.error('Error joining channel:', error);
      throw new Error('Failed to join channel');
    }
  }

  async leaveChannel(): Promise<void> {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.setEnabled(false);
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        if (this.client) {
          await this.client.unpublish([this.localAudioTrack]);
        }
        this.localAudioTrack = null;
      }

      if (this.client && this.currentChannel) {
        await this.client.leave();
        this.currentChannel = null;
      }
    } catch (error) {
      console.error('Error leaving channel:', error);
      throw new Error('Failed to leave channel');
    }
  }

  enableAudio(): void {
    if (!this.localAudioTrack) {
      throw new Error('No audio track available');
    }
    this.localAudioTrack.setEnabled(true);
  }

  disableAudio(): void {
    if (!this.localAudioTrack) {
      throw new Error('No audio track available');
    }
    this.localAudioTrack.setEnabled(false);
  }
}

export default AgoraService;