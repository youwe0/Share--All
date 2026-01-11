import type { ChunkProgress, FileMetadata } from "./transfer";

export type AppMode = "home" | "create" | "join" | "room";

export type TransferDirection = "sending" | "receiving" | null;

export interface TransferState {
  isActive: boolean;
  direction: TransferDirection;
  progress: ChunkProgress | null;
  fileMetadata: FileMetadata | null;
}

export type ErrorType =
  | "connection"
  | "transfer"
  | "signaling"
  | "permission"
  | "validation";

export interface AppError {
  type: ErrorType;
  message: string;
  timestamp: number;
}

export interface AppState {
  mode: AppMode;
  roomId: string | null;
  peerId: string;
  remotePeerId: string | null;
  connectionState: RTCPeerConnectionState;
  transferState: TransferState;
  error: AppError | null;
  isRoomCreator: boolean; // Track if user created the room or joined
}
