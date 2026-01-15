export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface FileChunk {
  index: number;
  data: ArrayBuffer;
  totalChunks: number;
}

export type ChunkProgress = {
  chunksTransferred: number;
  totalChunks: number;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  speed: number;
  eta: number;
};

export const TransferMessageType = {
  METADATA: "metadata",
  CHUNK: "chunk",
  COMPLETE: "complete",
  ERROR: "error",
  ACK: "ack",
  NACK: "nack",
} as const;

export type TransferMessageType =
  (typeof TransferMessageType)[keyof typeof TransferMessageType];

export interface BaseTransferMessage {
  type: TransferMessageType;
}

export interface MetadataMessage extends BaseTransferMessage {
  type: typeof TransferMessageType.METADATA;
  metadata: FileMetadata;
}

export interface ChunkMessage extends BaseTransferMessage {
  type: typeof TransferMessageType.CHUNK;
  index: number;
  totalChunks: number;
  data: ArrayBuffer;
}

export interface CompleteMessage extends BaseTransferMessage {
  type: typeof TransferMessageType.COMPLETE;
  checksum?: string;
}

export interface TransferErrorMessage extends BaseTransferMessage {
  type: typeof TransferMessageType.ERROR;
  error: string;
}

export interface AckMessage extends BaseTransferMessage {
  type: typeof TransferMessageType.ACK;
}

export interface NackMessage extends BaseTransferMessage {
  type: typeof TransferMessageType.NACK;
  missingChunks: number[];
}

export type TransferMessage =
  | MetadataMessage
  | ChunkMessage
  | CompleteMessage
  | TransferErrorMessage
  | AckMessage
  | NackMessage;
