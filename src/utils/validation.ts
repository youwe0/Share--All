import type { QRCodeData } from "../types/signaling";
import type { FileMetadata } from "../types/transfer";

export function validateRoomId(roomId: string): boolean {
  return /^[A-Za-z0-9_-]{21}$/.test(roomId);
}

export function validatePeerId(peerId: string): boolean {
  return /^[A-Za-z0-9_-]{16}$/.test(peerId);
}

export function isQRCodeData(data: unknown): data is QRCodeData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.version === "string" &&
    typeof obj.roomId === "string" &&
    typeof obj.signalingUrl === "string" &&
    typeof obj.timestamp === "number" &&
    validateRoomId(obj.roomId)
  );
}

export function isFileMetadata(data: unknown): data is FileMetadata {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.name === "string" &&
    typeof obj.size === "number" &&
    typeof obj.type === "string" &&
    typeof obj.lastModified === "number"
  );
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function validateFileSize(size: number, maxSize?: number): boolean {
  if (size <= 0) return false;
  if (maxSize && size > maxSize) return false;
  return true;
}
