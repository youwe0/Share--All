import type { FileMetadata, ChunkProgress } from "../types/transfer";

export class FileChunkService {
  private readonly CHUNK_SIZE = 64 * 1024; // 64KB - optimal for large file transfers
  private chunks: Map<number, ArrayBuffer> = new Map();
  private metadata: FileMetadata | null = null;
  private startTime: number = 0;

  async *createChunks(
    file: File
  ): AsyncGenerator<{ index: number; data: ArrayBuffer; totalChunks: number }> {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    let offset = 0;
    let index = 0;

    while (offset < file.size) {
      const blob = file.slice(offset, offset + this.CHUNK_SIZE);
      const arrayBuffer = await this.readBlobAsArrayBuffer(blob);

      yield {
        index,
        data: arrayBuffer,
        totalChunks,
      };

      offset += this.CHUNK_SIZE;
      index++;
    }
  }

  private readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read blob as ArrayBuffer"));
        }
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsArrayBuffer(blob);
    });
  }

  setMetadata(metadata: FileMetadata): void {
    this.metadata = metadata;
    this.startTime = Date.now();
  }

  getMetadata(): FileMetadata | null {
    return this.metadata;
  }

  addChunk(index: number, data: ArrayBuffer): void {
    this.chunks.set(index, data);
  }

  hasChunk(index: number): boolean {
    return this.chunks.has(index);
  }

  getChunk(index: number): ArrayBuffer | undefined {
    return this.chunks.get(index);
  }

  isComplete(totalChunks: number): boolean {
    return this.chunks.size === totalChunks;
  }

  reassembleFile(): Blob {
    if (!this.metadata) {
      throw new Error("Metadata not set");
    }

    const sortedChunks = Array.from(this.chunks.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, data]) => data);

    const blob = new Blob(sortedChunks, { type: this.metadata.type });

    this.chunks.clear();

    return blob;
  }

  calculateProgress(currentChunk: number, totalChunks: number): ChunkProgress {
    const now = Date.now();
    const bytesTransferred = (currentChunk + 1) * this.CHUNK_SIZE;
    const totalBytes = this.metadata
      ? this.metadata.size
      : totalChunks * this.CHUNK_SIZE;

    const elapsedSeconds = (now - this.startTime) / 1000;
    const speed = elapsedSeconds > 0 ? bytesTransferred / elapsedSeconds : 0;

    const remaining = totalBytes - bytesTransferred;
    const eta = speed > 0 ? remaining / speed : 0;

    const percentage = (currentChunk / totalChunks) * 100;

    return {
      chunksTransferred: currentChunk + 1,
      totalChunks,
      bytesTransferred: Math.min(bytesTransferred, totalBytes),
      totalBytes,
      percentage: Math.min(percentage, 100),
      speed,
      eta,
    };
  }

  reset(): void {
    this.chunks.clear();
    this.metadata = null;
    this.startTime = 0;
  }

  getChunkSize(): number {
    return this.CHUNK_SIZE;
  }

  getTotalChunks(fileSize: number): number {
    return Math.ceil(fileSize / this.CHUNK_SIZE);
  }

  downloadFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
