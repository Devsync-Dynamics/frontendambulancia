import type AgoraRTC from 'agora-rtc-sdk-ng';
import type { 
  IAgoraRTCClient, 
  ILocalAudioTrack, 
  IAgoraRTCRemoteUser, 
  IRemoteAudioTrack,
  ClientRole
} from "agora-rtc-sdk-ng";

// Tipos para los event handlers
type EventCallback = (...args: any[]) => void;
interface EventHandlers {
  [key: string]: EventCallback[];
}

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: ILocalAudioTrack | null = null;
  private appId: string;
  private currentChannel: string | null = null;
  private AgoraRTC: typeof AgoraRTC | null = null;
  private eventHandlers: EventHandlers = {};
  private remoteUsers: Map<string, IRemoteAudioTrack> = new Map();

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
      console.log(`[Agora] Connection state changed from ${prevState} to ${curState}`);
    });

    this.client.on("exception", (event) => {
      console.warn("[Agora] Client exception:", event);
    });

    this.client.on("user-joined", (user) => {
      console.log(`[Agora] User ${user.uid} joined the channel`);
    });

    this.client.on("user-left", (user) => {
      console.log(`[Agora] User ${user.uid} left the channel`);
    });

    this.client.on("user-published", async (user, mediaType) => {
      console.log(`[Agora] User ${user.uid} published ${mediaType} track`);
      await this.handleUserPublished(user, mediaType);
    });

    this.client.on("user-unpublished", (user, mediaType) => {
      console.log(`[Agora] User ${user.uid} unpublished ${mediaType} track`);
      this.handleUserUnpublished(user, mediaType);
    });

    // Monitorear el volumen del audio
    this.client.enableAudioVolumeIndicator();
    this.client.on("volume-indicator", (volumes) => {
      volumes.forEach((volume) => {
        if (volume.level > 5) { // Solo logear cuando hay audio significativo
          console.log(`[Agora] User ${volume.uid} speaking with volume ${volume.level}`);
        }
      });
    });
  }

  private async handleUserPublished(user: IAgoraRTCRemoteUser, mediaType: string): Promise<void> {
    if (!this.client) return;

    try {
      if (mediaType === "audio") {
        // Suscribirse al audio del usuario remoto
        await this.client.subscribe(user, mediaType);
        if (user.audioTrack) {
          user.audioTrack.play();
          this.remoteUsers.set(user.uid.toString(), user.audioTrack);
          this.emit('userPublished', user, mediaType);
        }
      }
    } catch (error) {
      console.error('Error handling user published:', error);
    }
  }

  private handleUserUnpublished(user: IAgoraRTCRemoteUser, mediaType: string): void {
    if (mediaType === "audio") {
      const audioTrack = this.remoteUsers.get(user.uid.toString());
      if (audioTrack) {
        audioTrack.stop();
        this.remoteUsers.delete(user.uid.toString());
      }
      this.emit('userUnpublished', user, mediaType);
    }
  }

  // Sistema de eventos
  on(eventName: string, callback: EventCallback): void {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(callback);
  }

  private emit(eventName: string, ...args: any[]): void {
    const handlers = this.eventHandlers[eventName];
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
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
      // Detener y limpiar todos los tracks de audio remotos
      this.remoteUsers.forEach(track => {
        track.stop();
      });
      this.remoteUsers.clear();

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
    console.log('[Agora] Enabling local audio track');
    this.localAudioTrack.setEnabled(true);
  }

  disableAudio(): void {
    if (!this.localAudioTrack) {
      throw new Error('No audio track available');
    }
    console.log('[Agora] Disabling local audio track');
    this.localAudioTrack.setEnabled(false);
  }


  setVolume(volume: number): void {
    if (!this.localAudioTrack) {
      throw new Error('No audio track available');
    }
    this.localAudioTrack.setVolume(volume);
  }
}

export default AgoraService;