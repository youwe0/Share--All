import { useState, useEffect, useCallback, useRef } from 'react';
import { SignalingClient } from '../services/SignalingClient';
import type { SignalingMessage, SignalingMessageType } from '../types/signaling';

interface UseSignalingReturn {
  isConnected: boolean;
  error: string | null;
  connect: (url: string) => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: SignalingMessage) => void;
  onMessage: (type: SignalingMessageType, handler: (message: SignalingMessage) => void) => void;
  offMessage: (type: SignalingMessageType, handler: (message: SignalingMessage) => void) => void;
}

export function useSignaling(): UseSignalingReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<SignalingClient | null>(null);

  const connect = useCallback(async (url: string) => {
    try {
      setError(null);
      const client = new SignalingClient(url);
      clientRef.current = client;

      await client.connect();
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to signaling server';
      setError(errorMessage);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: SignalingMessage) => {
    if (clientRef.current) {
      clientRef.current.send(message);
    } else {
      console.error('SignalingClient not initialized');
    }
  }, []);

  const onMessage = useCallback((type: SignalingMessageType, handler: (message: SignalingMessage) => void) => {
    if (clientRef.current) {
      clientRef.current.on(type, handler);
    }
  }, []);

  const offMessage = useCallback((type: SignalingMessageType, handler: (message: SignalingMessage) => void) => {
    if (clientRef.current) {
      clientRef.current.off(type, handler);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    onMessage,
    offMessage,
  };
}
