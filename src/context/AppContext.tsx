import { createContext, useState, useCallback, type ReactNode } from 'react';
import { generatePeerId } from '../utils/roomId';
import type { AppError, AppMode, AppState, TransferState } from '../types/app';
import type { ChunkProgress, FileMetadata } from '../types/transfer';

export interface AppContextValue extends AppState {
  setMode: (mode: AppMode) => void;
  setRoomId: (roomId: string | null) => void;
  setRemotePeerId: (peerId: string | null) => void;
  setConnectionState: (state: RTCPeerConnectionState) => void;
  setTransferState: (state: Partial<TransferState>) => void;
  updateProgress: (progress: ChunkProgress) => void;
  setFileMetadata: (metadata: FileMetadata | null) => void;
  setError: (error: AppError | null) => void;
  setIsRoomCreator: (isCreator: boolean) => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: AppState = {
  mode: 'home',
  roomId: null,
  peerId: generatePeerId(),
  remotePeerId: null,
  connectionState: 'new',
  transferState: {
    isActive: false,
    direction: null,
    progress: null,
    fileMetadata: null,
  },
  error: null,
  isRoomCreator: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const setMode = useCallback((mode: AppMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const setRoomId = useCallback((roomId: string | null) => {
    setState((prev) => ({ ...prev, roomId }));
  }, []);

  const setRemotePeerId = useCallback((peerId: string | null) => {
    setState((prev) => ({ ...prev, remotePeerId: peerId }));
  }, []);

  const setConnectionState = useCallback((connectionState: RTCPeerConnectionState) => {
    setState((prev) => ({ ...prev, connectionState }));
  }, []);

  const setTransferState = useCallback((updates: Partial<TransferState>) => {
    setState((prev) => ({
      ...prev,
      transferState: {
        ...prev.transferState,
        ...updates,
      },
    }));
  }, []);

  const updateProgress = useCallback((progress: ChunkProgress) => {
    setState((prev) => ({
      ...prev,
      transferState: {
        ...prev.transferState,
        progress,
      },
    }));
  }, []);

  const setFileMetadata = useCallback((fileMetadata: FileMetadata | null) => {
    setState((prev) => ({
      ...prev,
      transferState: {
        ...prev.transferState,
        fileMetadata,
      },
    }));
  }, []);

  const setError = useCallback((error: AppError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setIsRoomCreator = useCallback((isRoomCreator: boolean) => {
    setState((prev) => ({ ...prev, isRoomCreator }));
  }, []);

  const resetApp = useCallback(() => {
    setState({
      ...initialState,
      peerId: generatePeerId(),
    });
  }, []);

  const value: AppContextValue = {
    ...state,
    setMode,
    setRoomId,
    setRemotePeerId,
    setConnectionState,
    setTransferState,
    updateProgress,
    setFileMetadata,
    setError,
    setIsRoomCreator,
    resetApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}


export default AppContext

// export function useAppContext(): AppContextValue {
//   const context = useContext(AppContext);
//   if (!context) {
//     throw new Error('useAppContext must be used within AppProvider');
//   }
//   return context;
// }
