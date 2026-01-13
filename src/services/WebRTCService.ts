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

  sendData(data: ArrayBuffer): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Data channel is not open');
      return;
    }

    this.dataChannel.send(data);
  }

  async sendDataWithBackpressure(data: ArrayBuffer): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error(`Data channel is not open. Current state: ${this.dataChannel?.readyState || 'null'}`);
    }

    // CRITICAL: Check buffer BEFORE attempting to send to prevent "send queue is full" error
    const BUFFER_THRESHOLD = 8 * 1024 * 1024; // 8MB (reduced from 16MB for safety margin)
    const TIMEOUT_MS = 60000; // 60 seconds timeout (increased for large files)
    const POLL_INTERVAL_MS = 50; // Poll every 50ms
    const MAX_BUFFER_SIZE = 16 * 1024 * 1024; // Max buffer size before we must wait

    // Calculate safe send size accounting for data we're about to add
    const dataSize = data.byteLength;
    const currentBuffered = this.dataChannel.bufferedAmount;
    const totalAfterSend = currentBuffered + dataSize;

    // If sending this data would exceed the maximum safe buffer size, wait first
    if (totalAfterSend > MAX_BUFFER_SIZE) {
      const targetThreshold = BUFFER_THRESHOLD / 2; // Drain to 4MB
      let waitCount = 0;

      console.log(`Buffer would overflow (${(totalAfterSend / (1024 * 1024)).toFixed(2)} MB > ${(MAX_BUFFER_SIZE / (1024 * 1024)).toFixed(2)} MB). Waiting for drain to ${(targetThreshold / (1024 * 1024)).toFixed(2)} MB...`);

      // Wait for buffer to drain below target threshold
      while (this.dataChannel.bufferedAmount > targetThreshold) {
        // Check if data channel is still valid
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
          throw new Error(`Data channel closed during backpressure wait. State: ${this.dataChannel?.readyState || 'null'}`);
        }

        // Check if peer connection is still valid
        if (this.peerConnection && this.peerConnection.connectionState !== 'connected') {
          throw new Error(`Peer connection is not connected. State: ${this.peerConnection.connectionState}`);
        }

        waitCount++;
        if (waitCount % 10 === 0) {
          console.log(`Still waiting... Buffer: ${(this.dataChannel.bufferedAmount / (1024 * 1024)).toFixed(2)} MB, Target: ${(targetThreshold / (1024 * 1024)).toFixed(2)} MB`);
        }

        const channel = this.dataChannel;

        await new Promise<void>((resolve, reject) => {
          let isResolved = false;
          let timeoutId: ReturnType<typeof setTimeout> | null = null;
          let pollIntervalId: ReturnType<typeof setInterval> | null = null;

          const cleanup = () => {
            isResolved = true;
            if (timeoutId !== null) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            if (pollIntervalId !== null) {
              clearInterval(pollIntervalId);
              pollIntervalId = null;
            }
            if (channel && onLow) {
              channel.removeEventListener('bufferedamountlow', onLow);
            }
          };

          const onLow = () => {
            if (!isResolved) {
              cleanup();
              resolve();
            }
          };

          // Set timeout
          timeoutId = setTimeout(() => {
            if (!isResolved) {
              cleanup();
              reject(new Error(`Timeout waiting for buffer to drain. Current: ${channel.bufferedAmount}, Target: ${targetThreshold}`));
            }
          }, TIMEOUT_MS);

          // Set the threshold BEFORE adding event listener to avoid race condition
          channel.bufferedAmountLowThreshold = targetThreshold;

          // Check immediately before setting up listener (race condition prevention)
          if (channel.bufferedAmount <= targetThreshold) {
            cleanup();
            resolve();
            return;
          }

          // Add event listener for bufferedamountlow event
          channel.addEventListener('bufferedamountlow', onLow, { once: false });

          // Check again immediately after adding listener (double-check race condition)
          if (channel.bufferedAmount <= targetThreshold) {
            cleanup();
            resolve();
            return;
          }

          // Fallback: Poll the buffer amount as backup (in case event doesn't fire)
          pollIntervalId = setInterval(() => {
            if (!channel || channel.readyState !== 'open') {
              cleanup();
              reject(new Error('Data channel closed during polling'));
              return;
            }

            if (channel.bufferedAmount <= targetThreshold) {
              cleanup();
              resolve();
            }
          }, POLL_INTERVAL_MS);
        });
      }
    }

    // Final check before sending
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel closed before send');
    }

    // Send the data (buffer should now have space)
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
