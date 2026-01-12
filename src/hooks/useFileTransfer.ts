import { useState, useCallback, useRef } from "react";
import { FileChunkService } from "../services/FileChunkService";
import {
  TransferMessageType,
  type ChunkMessage,
  type ChunkProgress,
  type CompleteMessage,
  type FileMetadata,
  type MetadataMessage,
  type TransferMessage,
} from "../types/transfer";    

interface UseFileTransferReturn {
  isTransferring: boolean;
  isSending: boolean;
  isReceiving: boolean;
  progress: ChunkProgress | null;
  error: string | null;
  receivedFile: { blob: Blob; metadata: FileMetadata } | null;
  sendFile: (
    file: File,
    sendData: (data: ArrayBuffer) => Promise<void>
  ) => Promise<void>;
  handleIncomingData: (data: ArrayBuffer | string) => void;
  cancelTransfer: () => void;
  reset: () => void;
}

export function useFileTransfer(): UseFileTransferReturn {
  const [isTransferring, setIsTransferring] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [progress, setProgress] = useState<ChunkProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receivedFile, setReceivedFile] = useState<{
    blob: Blob;
    metadata: FileMetadata;
  } | null>(null);

  const chunkServiceRef = useRef(new FileChunkService());
  const cancelledRef = useRef(false);
  const lastProgressUpdateRef = useRef(0);

  const sendFile = useCallback(
    async (file: File, sendData: (data: ArrayBuffer) => Promise<void>) => {
      try {
        setIsTransferring(true);
        setIsSending(true);
        setError(null);
        cancelledRef.current = false;

        const metadata: FileMetadata = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        };

        const metadataMessage: MetadataMessage = {
          type: TransferMessageType.METADATA,
          metadata,
        };

        const metadataStr = JSON.stringify(metadataMessage);
        const metadataBuffer = new TextEncoder().encode(metadataStr);
        await sendData(metadataBuffer.buffer);

        chunkServiceRef.current.setMetadata(metadata);

        let chunkIndex = 0;
        const totalChunks = chunkServiceRef.current.getTotalChunks(file.size);

        for await (const chunk of chunkServiceRef.current.createChunks(file)) {
          if (cancelledRef.current) {
            throw new Error("Transfer cancelled");
          }

          const chunkMessage: ChunkMessage = {
            type: TransferMessageType.CHUNK,
            index: chunk.index,
            totalChunks: chunk.totalChunks,
            data: chunk.data,
          };

          const messageStr = JSON.stringify({
            type: chunkMessage.type,
            index: chunkMessage.index,
            totalChunks: chunkMessage.totalChunks,
          });
          const headerBuffer = new TextEncoder().encode(messageStr + "\n");

          const combined = new Uint8Array(
            headerBuffer.length + chunk.data.byteLength
          );
          combined.set(new Uint8Array(headerBuffer), 0);
          combined.set(new Uint8Array(chunk.data), headerBuffer.length);

          await sendData(combined.buffer);

          // Throttle progress updates to avoid excessive re-renders
          const now = Date.now();
          if (now - lastProgressUpdateRef.current > 100) {
            const currentProgress = chunkServiceRef.current.calculateProgress(
              chunkIndex,
              totalChunks
            );
            setProgress(currentProgress);
            lastProgressUpdateRef.current = now;
          }

          chunkIndex++;
        }

        const completeMessage: CompleteMessage = {
          type: TransferMessageType.COMPLETE,
        };

        const completeStr = JSON.stringify(completeMessage);
        const completeBuffer = new TextEncoder().encode(completeStr);
        await sendData(completeBuffer.buffer);

        setIsTransferring(false);
        setIsSending(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "File transfer failed";
        setError(errorMessage);
        setIsTransferring(false);
        setIsSending(false);
      }
    },
    []
  );

  const handleIncomingData = useCallback((data: ArrayBuffer | string) => {
    try {
      // All data comes as ArrayBuffer from WebRTC DataChannel
      if (data instanceof ArrayBuffer) {
        const view = new Uint8Array(data);
        const newlineIndex = view.indexOf(10); // Look for newline character

        // If there's a newline, this is a CHUNK message
        if (newlineIndex !== -1) {
          const headerBuffer = data.slice(0, newlineIndex);
          const chunkData = data.slice(newlineIndex + 1);

          const headerStr = new TextDecoder().decode(headerBuffer);
          const header = JSON.parse(headerStr);

          if (header.type === TransferMessageType.CHUNK) {
            chunkServiceRef.current.addChunk(header.index, chunkData);

            // Throttle progress updates to avoid excessive re-renders
            const now = Date.now();
            if (now - lastProgressUpdateRef.current > 100) {
              const currentProgress = chunkServiceRef.current.calculateProgress(
                header.index,
                header.totalChunks
              );
              setProgress(currentProgress);
              lastProgressUpdateRef.current = now;
            }
          }
        } else {
          // No newline means this is a JSON message (METADATA or COMPLETE)
          const messageStr = new TextDecoder().decode(data);
          const message: TransferMessage = JSON.parse(messageStr);

          if (message.type === TransferMessageType.METADATA) {
            const metadataMsg = message as MetadataMessage;
            chunkServiceRef.current.setMetadata(metadataMsg.metadata);
            setIsTransferring(true);
            setIsReceiving(true);
            setError(null);
            console.log('Receiving file:', metadataMsg.metadata.name);
          } else if (message.type === TransferMessageType.COMPLETE) {
            const metadata = chunkServiceRef.current.getMetadata();
            if (metadata) {
              const blob = chunkServiceRef.current.reassembleFile();
              setReceivedFile({ blob, metadata });
              chunkServiceRef.current.downloadFile(blob, metadata.name);
              console.log('File received and downloaded:', metadata.name);
            }
            setIsTransferring(false);
            setIsReceiving(false);
            setProgress(null);
          }
        }
      } else if (typeof data === "string") {
        // Fallback for string data (shouldn't happen with binary channel)
        const message: TransferMessage = JSON.parse(data);

        if (message.type === TransferMessageType.METADATA) {
          const metadataMsg = message as MetadataMessage;
          chunkServiceRef.current.setMetadata(metadataMsg.metadata);
          setIsTransferring(true);
          setIsReceiving(true);
          setError(null);
        } else if (message.type === TransferMessageType.COMPLETE) {
          const metadata = chunkServiceRef.current.getMetadata();
          if (metadata) {
            const blob = chunkServiceRef.current.reassembleFile();
            setReceivedFile({ blob, metadata });
            chunkServiceRef.current.downloadFile(blob, metadata.name);
          }
          setIsTransferring(false);
          setIsReceiving(false);
          setProgress(null);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error handling incoming data";
      setError(errorMessage);
      console.error('Error handling incoming data:', err);
    }
  }, []);

  const cancelTransfer = useCallback(() => {
    cancelledRef.current = true;
    setIsTransferring(false);
    setIsSending(false);
    setIsReceiving(false);
    setProgress(null);
  }, []);

  const reset = useCallback(() => {
    chunkServiceRef.current.reset();
    setIsTransferring(false);
    setIsSending(false);
    setIsReceiving(false);
    setProgress(null);
    setError(null);
    setReceivedFile(null);
    cancelledRef.current = false;
  }, []);

  return {
    isTransferring,
    isSending,
    isReceiving,
    progress,
    error,
    receivedFile,
    sendFile,
    handleIncomingData,
    cancelTransfer,
    reset,
  };
}
