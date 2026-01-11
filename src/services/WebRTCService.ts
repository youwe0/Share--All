export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export interface WebRTCCallbacks {
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onDataChannelOpen: () => void;
  onDataChannelClose: () => void;
  onDataChannelError: (error: Event) => void;
  onDataChannelMessage: (event: MessageEvent<ArrayBuffer | string>) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onDataChannel?: (channel: RTCDataChannel) => void;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private callbacks: WebRTCCallbacks | null = null;

  private readonly DATA_CHANNEL_CONFIG: RTCDataChannelInit = {
    ordered: true,
    maxRetransmits: 3,
  };

  private readonly DEFAULT_RTC_CONFIG: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };

  initialize(callbacks: WebRTCCallbacks, config?: WebRTCConfig): void {
    this.callbacks = callbacks;
    const rtcConfig = config || this.DEFAULT_RTC_CONFIG;

    this.peerConnection = new RTCPeerConnection(rtcConfig);

    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && this.callbacks) {
        this.callbacks.onIceCandidate(event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection && this.callbacks) {
        this.callbacks.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    this.peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();

      if (this.callbacks?.onDataChannel) {
        this.callbacks.onDataChannel(this.dataChannel);
      }
    };
  }

  createDataChannel(label: string): RTCDataChannel | null {
    if (!this.peerConnection) {
      console.error('Peer connection not initialized');
      return null;
    }

    this.dataChannel = this.peerConnection.createDataChannel(label, this.DATA_CHANNEL_CONFIG);
    this.setupDataChannel();

    return this.dataChannel;
  }

  private setupDataChannel(): void {
    if (!this.dataChannel || !this.callbacks) return;

    this.dataChannel.binaryType = 'arraybuffer';

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
      if (this.callbacks) {
        this.callbacks.onDataChannelOpen();
      }
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
      if (this.callbacks) {
        this.callbacks.onDataChannelClose();
      }
    };

    this.dataChannel.onerror = (error: Event) => {
      console.error('Data channel error:', error);
      if (this.callbacks) {
        this.callbacks.onDataChannelError(error);
      }
    };

    this.dataChannel.onmessage = (event: MessageEvent<ArrayBuffer | string>) => {
      if (this.callbacks) {
        this.callbacks.onDataChannelMessage(event);
      }
    };

    const channel = this.dataChannel;
    channel.bufferedAmountLowThreshold = 65536;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(description);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  sendData(data: ArrayBuffer | string): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Data channel is not open');
      return;
    }

    this.dataChannel.send(data);
  }

  async sendDataWithBackpressure(data: ArrayBuffer): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel is not open');
    }

    const BUFFER_THRESHOLD = 16 * 1024 * 1024;

    if (this.dataChannel.bufferedAmount > BUFFER_THRESHOLD) {
      await new Promise<void>((resolve) => {
        if (!this.dataChannel) return;

        const checkBuffer = () => {
          if (this.dataChannel && this.dataChannel.bufferedAmount < BUFFER_THRESHOLD) {
            this.dataChannel.removeEventListener('bufferedamountlow', checkBuffer);
            resolve();
          }
        };

        this.dataChannel.addEventListener('bufferedamountlow', checkBuffer);
      });
    }

    this.dataChannel.send(data);
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection ? this.peerConnection.connectionState : null;
  }

  getDataChannelState(): RTCDataChannelState | null {
    return this.dataChannel ? this.dataChannel.readyState : null;
  }

  getBufferedAmount(): number {
    return this.dataChannel ? this.dataChannel.bufferedAmount : 0;
  }

  close(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.callbacks = null;
  }
}
