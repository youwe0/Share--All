import { useState, useCallback, useRef } from "react";
import { FileChunkService } from "../services/FileChunkService";
import {
  TransferMessageType,
  type AckMessage,
  type ChunkMessage,
  type ChunkProgress,
  type CompleteMessage,
  type FileMetadata,
  type MetadataMessage,
  type NackMessage,
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
    sendData: (data: ArrayBuffer) => Promise<void>,
    getBufferedAmount: () => number
  ) => Promise<void>;
  handleIncomingData: (data: ArrayBuffer | string, sendData?: (data: ArrayBuffer) => Promise<void>) => void;
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
  const ackResolveRef = useRef<(() => void) | null>(null);
  const ackReceivedRef = useRef(false);
  const sendDataRef = useRef<((data: ArrayBuffer) => Promise<void>) | null>(null);
  const currentFileRef = useRef<File | null>(null);
  const nackResolveRef = useRef<(() => void) | null>(null);

  const sendFile = useCallback(
    async (file: File, sendData: (data: ArrayBuffer) => Promise<void>, getBufferedAmount: () => number) => {
      ackReceivedRef.current = false;

      // Store references for retransmission
      sendDataRef.current = sendData;
      currentFileRef.current = file;

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

        console.log(`Starting file transfer: ${metadata.name} (${(metadata.size / (1024 * 1024)).toFixed(2)} MB)`);

        chunkServiceRef.current.setMetadata(metadata);

        let chunkIndex = 0;
        const totalChunks = chunkServiceRef.current.getTotalChunks(file.size);
        const transferStartTime = Date.now();

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

          try {
            await sendData(combined.buffer);
          } catch (err) {
            console.error(`Failed to send chunk ${chunkIndex}/${totalChunks}:`, err);
            throw new Error(`Transfer failed at chunk ${chunkIndex}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }

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

          // Log progress every 100 chunks for debugging
          if (chunkIndex % 100 === 0) {
            const elapsed = (Date.now() - transferStartTime) / 1000;
            const speed = ((chunkIndex * chunk.data.byteLength) / elapsed / (1024 * 1024)).toFixed(2);
            console.log(`Sent ${chunkIndex}/${totalChunks} chunks (${((chunkIndex / totalChunks) * 100).toFixed(1)}%) - ${speed} MB/s`);
          }

        }

        console.log(`All chunks sent (${chunkIndex}/${totalChunks}). Waiting for buffer to flush...`);

        // CRITICAL: Wait for buffer to drain before sending COMPLETE message
        // This ensures all chunks arrive at receiver before COMPLETE message
        const startFlushWait = Date.now();
        const MAX_FLUSH_WAIT = 30000; // 30 seconds max wait
        const POLL_INTERVAL = 100; // Check every 100ms
        const TARGET_BUFFER = 64 * 1024; // Wait until buffer is under 64KB

        // Poll the buffer until it's empty or mostly drained
        const waitForBufferDrain = async (): Promise<void> => {
          return new Promise((resolve) => {
            const checkBuffer = () => {
              const elapsed = Date.now() - startFlushWait;
              const bufferedAmount = getBufferedAmount();

              // Log current buffer status every second
              if (elapsed > 0 && elapsed % 1000 < POLL_INTERVAL) {
                console.log(`Waiting for buffer to drain: ${(bufferedAmount / (1024 * 1024)).toFixed(2)} MB buffered`);
              }

              // Timeout check
              if (elapsed > MAX_FLUSH_WAIT) {
                console.warn(`Buffer flush timeout after ${(elapsed / 1000).toFixed(1)}s. Buffered: ${(bufferedAmount / (1024 * 1024)).toFixed(2)} MB. Proceeding anyway.`);
                resolve();
                return;
              }

              // Check if buffer has drained sufficiently
              if (bufferedAmount <= TARGET_BUFFER) {
                console.log(`Buffer drained after ${(elapsed / 1000).toFixed(1)}s. Remaining: ${bufferedAmount} bytes`);
                resolve();
                return;
              }

              // Continue waiting
              setTimeout(checkBuffer, POLL_INTERVAL);
            };

            checkBuffer();
          });
        };

        await waitForBufferDrain();

        // Send complete message
        const completeMessage: CompleteMessage = {
          type: TransferMessageType.COMPLETE,
        };

        const completeStr = JSON.stringify(completeMessage);
        const completeBuffer = new TextEncoder().encode(completeStr);
        await sendData(completeBuffer.buffer);

        console.log(`COMPLETE message sent. Waiting for receiver acknowledgment...`);

        // Wait for ACK from receiver with timeout
        const ACK_TIMEOUT = 30000; // 30 seconds

        // Wait for ACK or NACK with retransmission support
        const MAX_RETRANSMIT_ROUNDS = 5;
        let retransmitRound = 0;

        while (retransmitRound < MAX_RETRANSMIT_ROUNDS) {
          try {
            // Create a promise that resolves on ACK or rejects on timeout
            const waitPromise = new Promise<'ack' | 'nack'>((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                if (!ackReceivedRef.current) {
                  reject(new Error('Timeout waiting for receiver acknowledgment'));
                }
              }, ACK_TIMEOUT);

              // Set up ACK resolver
              const originalAckResolve = ackResolveRef.current;
              ackResolveRef.current = () => {
                clearTimeout(timeoutId);
                if (originalAckResolve) originalAckResolve();
                resolve('ack');
              };

              // Set up NACK resolver
              nackResolveRef.current = () => {
                clearTimeout(timeoutId);
                resolve('nack');
              };
            });

            const result = await waitPromise;

            if (result === 'ack') {
              console.log(`Transfer confirmed by receiver. File transfer complete: ${totalChunks} chunks (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
              break;
            }
            // If NACK, the handleIncomingData will trigger retransmission
            // and we'll loop again
            retransmitRound++;
            console.log(`Retransmission round ${retransmitRound} completed, waiting for next response...`);
          } catch (ackError) {
            console.warn('Did not receive ACK from receiver, but all data was sent:', ackError);
            break;
          }
        }

        if (retransmitRound >= MAX_RETRANSMIT_ROUNDS) {
          console.error(`Failed after ${MAX_RETRANSMIT_ROUNDS} retransmission attempts`);
          setError(`Transfer failed: receiver still missing chunks after ${MAX_RETRANSMIT_ROUNDS} retransmission attempts`);
        }

        // Final progress update to show 100%
        setProgress(chunkServiceRef.current.calculateProgress(totalChunks - 1, totalChunks));

        setIsTransferring(false);
        setIsSending(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "File transfer failed";
        console.error('File transfer error:', errorMessage, err);
        setError(errorMessage);
        setIsTransferring(false);
        setIsSending(false);
      }
    },
    []
  );

  // Helper function to retransmit specific chunks by re-reading from file
  const retransmitChunks = useCallback(async (missingChunks: number[], sendData: (data: ArrayBuffer) => Promise<void>) => {
    console.log(`📤 Retransmitting ${missingChunks.length} missing chunks: ${missingChunks.slice(0, 20).join(', ')}${missingChunks.length > 20 ? '...' : ''}`);

    const file = currentFileRef.current;
    if (!file) {
      console.error('No file reference for retransmission');
      return;
    }

    const chunkSize = chunkServiceRef.current.getChunkSize();
    const totalChunks = Math.ceil(file.size / chunkSize);
    let retransmitted = 0;

    for (const chunkIndex of missingChunks) {
      // Read chunk directly from file
      const offset = chunkIndex * chunkSize;
      const blob = file.slice(offset, Math.min(offset + chunkSize, file.size));

      try {
        const arrayBuffer = await blob.arrayBuffer();

        const messageStr = JSON.stringify({
          type: TransferMessageType.CHUNK,
          index: chunkIndex,
          totalChunks: totalChunks,
        });
        const headerBuffer = new TextEncoder().encode(messageStr + "\n");

        const combined = new Uint8Array(headerBuffer.length + arrayBuffer.byteLength);
        combined.set(new Uint8Array(headerBuffer), 0);
        combined.set(new Uint8Array(arrayBuffer), headerBuffer.length);

        await sendData(combined.buffer);
        retransmitted++;

        if (retransmitted % 10 === 0) {
          console.log(`Retransmitted ${retransmitted}/${missingChunks.length} chunks...`);
        }
      } catch (err) {
        console.error(`Failed to retransmit chunk ${chunkIndex}:`, err);
      }
    }

    console.log(`✅ Retransmitted ${retransmitted}/${missingChunks.length} chunks`);

    // Send another COMPLETE message after retransmission
    const completeMessage: CompleteMessage = {
      type: TransferMessageType.COMPLETE,
    };
    const completeStr = JSON.stringify(completeMessage);
    const completeBuffer = new TextEncoder().encode(completeStr);
    await sendData(completeBuffer.buffer);
    console.log('📤 Sent COMPLETE message after retransmission');
  }, []);

  const handleIncomingData = useCallback((data: ArrayBuffer | string, sendData?: (data: ArrayBuffer) => Promise<void>) => {
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
            chunkServiceRef.current.addChunk(header.index, chunkData, header.totalChunks);

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

            // Log progress every 100 chunks for debugging
            if ((header.index + 1) % 100 === 0) {
              console.log(`Received ${header.index + 1}/${header.totalChunks} chunks (${(((header.index + 1) / header.totalChunks) * 100).toFixed(1)}%)`);
            }
          }
        } else {
          // No newline means this is a JSON message (METADATA, COMPLETE, or ACK)
          const messageStr = new TextDecoder().decode(data);
          const message: TransferMessage = JSON.parse(messageStr);

          if (message.type === TransferMessageType.METADATA) {
            const metadataMsg = message as MetadataMessage;
            chunkServiceRef.current.setMetadata(metadataMsg.metadata);
            setIsTransferring(true);
            setIsReceiving(true);
            setError(null);
            console.log('Receiving file:', metadataMsg.metadata.name, `(${(metadataMsg.metadata.size / (1024 * 1024)).toFixed(2)} MB)`);
          } else if (message.type === TransferMessageType.COMPLETE) {
            console.log('✅ Received COMPLETE message from sender');
            const metadata = chunkServiceRef.current.getMetadata();

            if (!metadata) {
              console.error('❌ No metadata found when COMPLETE received');
              setError('No metadata found');
              return;
            }

            console.log(`📦 Attempting to reassemble file: ${metadata.name}`);

            // Check for missing chunks before attempting reassembly
            const missingChunks = chunkServiceRef.current.getMissingChunks();

            if (missingChunks.length > 0) {
              console.warn(`⚠️ Missing ${missingChunks.length} chunks: ${missingChunks.slice(0, 10).join(', ')}${missingChunks.length > 10 ? '...' : ''}`);

              // Send NACK to request retransmission
              if (sendData) {
                const nackMessage: NackMessage = {
                  type: TransferMessageType.NACK,
                  missingChunks: missingChunks,
                };
                const nackStr = JSON.stringify(nackMessage);
                const nackBuffer = new TextEncoder().encode(nackStr);

                console.log(`📤 Sending NACK requesting ${missingChunks.length} chunks`);

                sendData(nackBuffer.buffer)
                  .then(() => {
                    console.log('✅ NACK sent successfully to sender');
                  })
                  .catch((err) => {
                    console.error('❌ Failed to send NACK to sender:', err);
                  });
              } else {
                console.error('❌ sendData function not available! Cannot send NACK');
                setError(`Missing ${missingChunks.length} chunks and cannot request retransmission`);
              }
              return;
            }

            try {
              // Attempt to reassemble file (all chunks should be present now)
              const blob = chunkServiceRef.current.reassembleFile();

              // Verify blob size matches expected size
              if (blob.size !== metadata.size) {
                throw new Error(
                  `Final file size mismatch: expected ${metadata.size} bytes, got ${blob.size} bytes`
                );
              }

              console.log(
                `✅ File reassembled successfully: ${metadata.name} (${(blob.size / (1024 * 1024)).toFixed(2)} MB)`
              );

              setReceivedFile({ blob, metadata });
              chunkServiceRef.current.downloadFile(blob, metadata.name);
              console.log('💾 File download triggered:', metadata.name);

              // Send ACK back to sender
              console.log('📤 Preparing to send ACK to sender...');

              if (!sendData) {
                console.error('❌ sendData function not available! Cannot send ACK');
              } else {
                console.log('✅ sendData function is available');

                const ackMessage: AckMessage = {
                  type: TransferMessageType.ACK,
                };
                const ackStr = JSON.stringify(ackMessage);
                const ackBuffer = new TextEncoder().encode(ackStr);

                console.log(`📤 Sending ACK message (${ackBuffer.byteLength} bytes)`);

                sendData(ackBuffer.buffer)
                  .then(() => {
                    console.log('✅ ACK sent successfully to sender');
                  })
                  .catch((err) => {
                    console.error('❌ Failed to send ACK to sender:', err);
                  });
              }
            } catch (reassembleError) {
              const errorMsg = reassembleError instanceof Error
                ? reassembleError.message
                : 'Failed to reassemble file';
              console.error('❌ File reassembly failed:', errorMsg, reassembleError);
              setError(errorMsg);

              // Don't send ACK if reassembly failed
              return;
            }

            setIsTransferring(false);
            setIsReceiving(false);
            setProgress(null);
          } else if (message.type === TransferMessageType.NACK) {
            // Handle NACK message (for sender) - receiver is requesting missing chunks
            const nackMsg = message as NackMessage;
            console.log(`📥 Received NACK from receiver requesting ${nackMsg.missingChunks.length} chunks`);

            if (sendDataRef.current) {
              retransmitChunks(nackMsg.missingChunks, sendDataRef.current)
                .then(() => {
                  if (nackResolveRef.current) {
                    nackResolveRef.current();
                  }
                })
                .catch((err) => {
                  console.error('❌ Failed to retransmit chunks:', err);
                });
            } else {
              console.error('❌ sendData function not available for retransmission');
            }
          } else if (message.type === TransferMessageType.ACK) {
            // Handle ACK message (for sender)
            console.log('Received ACK from receiver');
            if (!ackReceivedRef.current) {
              ackReceivedRef.current = true;
              if (ackResolveRef.current) {
                ackResolveRef.current();
              }
            }
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

            // Send ACK back to sender
            if (sendData) {
              const ackMessage: AckMessage = {
                type: TransferMessageType.ACK,
              };
              const ackStr = JSON.stringify(ackMessage);
              const ackBuffer = new TextEncoder().encode(ackStr);
              sendData(ackBuffer.buffer).catch((err) => {
                console.warn('Failed to send ACK to sender:', err);
              });
            }
          }
          setIsTransferring(false);
          setIsReceiving(false);
          setProgress(null);
        } else if (message.type === TransferMessageType.ACK) {
          // Handle ACK message (for sender)
          if (!ackReceivedRef.current) {
            ackReceivedRef.current = true;
            if (ackResolveRef.current) {
              ackResolveRef.current();
            }
          }
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
