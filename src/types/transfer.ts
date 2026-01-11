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
}

export enum TransferMessageType {
  METADATA = 'metadata',
  CHUNK = 'chunk',
  COMPLETE = 'complete',
  ERROR = 'error',
  ACK = 'ack',
}

export interface BaseTransferMessage {
  type: TransferMessageType;
}

export interface MetadataMessage extends BaseTransferMessage {
  type: TransferMessageType.METADATA;
  metadata: FileMetadata;
}

export interface ChunkMessage extends BaseTransferMessage {
  type: TransferMessageType.CHUNK;
  index: number;
  totalChunks: number;
  data: ArrayBuffer;
}

export interface CompleteMessage extends BaseTransferMessage {
  type: TransferMessageType.COMPLETE;
  checksum?: string;
}

export interface TransferErrorMessage extends BaseTransferMessage {
  type: TransferMessageType.ERROR;
  error: string;
}

export interface AckMessage extends BaseTransferMessage {
  type: TransferMessageType.ACK;
}

export type TransferMessage =
  | MetadataMessage
  | ChunkMessage
  | CompleteMessage
  | TransferErrorMessage
  | AckMessage;
