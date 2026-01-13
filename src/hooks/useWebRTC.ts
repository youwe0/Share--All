import { useState, useCallback, useRef, useEffect } from 'react';
import { WebRTCService, type WebRTCCallbacks } from '../services/WebRTCService';

interface UseWebRTCReturn {
  connectionState: RTCPeerConnectionState | null;
  dataChannelState: RTCDataChannelState | null;
  isConnected: boolean;
  error: string | null;
  initialize: (callbacks: WebRTCCallbacks) => void;
  createDataChannel: (label: string) => void;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;
  setRemoteDescription: (description: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  sendData: (data: ArrayBuffer) => void;
  sendDataWithBackpressure: (data: ArrayBuffer) => Promise<void>;
  getBufferedAmount: () => number;
  close: () => void;
}

export function useWebRTC(): UseWebRTCReturn {
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  const [dataChannelState, setDataChannelState] = useState<RTCDataChannelState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<WebRTCService | null>(null);

  useEffect(() => {
    serviceRef.current = new WebRTCService();

    return () => {
      if (serviceRef.current) {
        serviceRef.current.close();
      }
    };
  }, []);

  const initialize = useCallback((callbacks: WebRTCCallbacks) => {
    if (!serviceRef.current) {
      serviceRef.current = new WebRTCService();
    }

    const wrappedCallbacks: WebRTCCallbacks = {
      ...callbacks,
      onConnectionStateChange: (state: RTCPeerConnectionState) => {
        setConnectionState(state);
        setIsConnected(state === 'connected');
        callbacks.onConnectionStateChange(state);
      },
      onDataChannelOpen: () => {
        setDataChannelState('open');
        callbacks.onDataChannelOpen();
      },
      onDataChannelClose: () => {
        setDataChannelState('closed');
        callbacks.onDataChannelClose();
      },
    };

    serviceRef.current.initialize(wrappedCallbacks);
  }, []);

  const createDataChannel = useCallback((label: string) => {
    if (serviceRef.current) {
      serviceRef.current.createDataChannel(label);
    }
  }, []);

  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    try {
      const offer = await serviceRef.current.createOffer();
      return offer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create offer';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    try {
      const answer = await serviceRef.current.createAnswer(offer);
      return answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create answer';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const setRemoteDescription = useCallback(async (description: RTCSessionDescriptionInit): Promise<void> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    try {
      await serviceRef.current.setRemoteDescription(description);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set remote description';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit): Promise<void> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    try {
      await serviceRef.current.addIceCandidate(candidate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add ICE candidate';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const sendData = useCallback((data: ArrayBuffer) => {
    if (serviceRef.current) {
      serviceRef.current.sendData(data);
    }
  }, []);

  const sendDataWithBackpressure = useCallback(async (data: ArrayBuffer): Promise<void> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    await serviceRef.current.sendDataWithBackpressure(data);
  }, []);

  const getBufferedAmount = useCallback((): number => {
    if (!serviceRef.current) {
      return 0;
    }
    return serviceRef.current.getBufferedAmount();
  }, []);

  const close = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.close();
      setConnectionState(null);
      setDataChannelState(null);
      setIsConnected(false);
    }
  }, []);

  return {
    connectionState,
    dataChannelState,
    isConnected,
    error,
    initialize,
    createDataChannel,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    sendData,
    sendDataWithBackpressure,
    getBufferedAmount,
    close,
  };
}
