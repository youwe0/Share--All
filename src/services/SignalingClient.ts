import type {
  SignalingMessage,
  SignalingMessageType,
} from "../types/signaling";

export type SignalingEventHandler = (message: SignalingMessage) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 2000;
  private eventHandlers: Map<SignalingMessageType, SignalingEventHandler[]> =
    new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent<string>) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          console.log("WebSocket closed");
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: SignalingMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  on(type: SignalingMessageType, handler: SignalingEventHandler): void {
    const handlers = this.eventHandlers.get(type) || [];
    handlers.push(handler);
    this.eventHandlers.set(type, handlers);
  }

  off(type: SignalingMessageType, handler: SignalingEventHandler): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private handleMessage(data: string): void {
    try {
      const message: SignalingMessage = JSON.parse(data);
      const handlers = this.eventHandlers.get(message.type);

      if (handlers) {
        handlers.forEach((handler) => handler(message));
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnect failed:", error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnect attempts reached");
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
