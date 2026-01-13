import { useEffect, useCallback } from "react";
import { useSignaling } from "../hooks/useSignaling";
import { useWebRTC } from "../hooks/useWebRTC";
import { useFileTransfer } from "../hooks/useFileTransfer";
import { FileDrop } from "./FileDrop";
import { ProgressBar } from "./ProgressBar";
import { ConnectionStatus } from "./ConnectionStatus";
import { QRCodeDisplay } from "./QRCodeDisplay";
import {
  SignalingMessageType,
  type AnswerMessage,
  type IceCandidateMessage,
  type JoinRoomMessage,
  type OfferMessage,
} from "../types/signaling";
import { useAppContext } from "../hooks/useAppContext";

export function Room() {
  const {
    roomId,
    peerId,
    remotePeerId,
    setRemotePeerId,
    connectionState,
    setConnectionState,
    transferState,
    setTransferState,
    updateProgress,
    setMode,
    setError,
    isRoomCreator,
  } = useAppContext();

  const signaling = useSignaling();
  const webrtc = useWebRTC();
  const fileTransfer = useFileTransfer();

  useEffect(() => {
    const signalingUrl =
      import.meta.env.VITE_SIGNALING_URL || "ws://localhost:3001";

    const initializeConnection = async () => {
      try {
        await signaling.connect(signalingUrl);

        webrtc.initialize({
          onIceCandidate: (candidate) => {
            const message: IceCandidateMessage = {
              type: SignalingMessageType.ICE_CANDIDATE,
              roomId: roomId!,
              candidate,
              from: peerId,
            };
            signaling.sendMessage(message);
          },
          onDataChannelOpen: () => {
            console.log("Data channel opened");
          },
          onDataChannelClose: () => {
            console.log("Data channel closed");
          },
          onDataChannelError: (error) => {
            console.error("Data channel error:", error);
            setError({
              type: "transfer",
              message: "Data channel error occurred",
              timestamp: Date.now(),
            });
          },
          onDataChannelMessage: (event) => {
            fileTransfer.handleIncomingData(event.data, webrtc.sendDataWithBackpressure);
          },
          onConnectionStateChange: (state) => {
            setConnectionState(state);
          },
        });

        signaling.onMessage(SignalingMessageType.ROOM_JOINED, () => {
          console.log("Room joined successfully");
        });

        signaling.onMessage(
          SignalingMessageType.PEER_JOINED,
          async (message) => {
            const peerJoinedMsg = message as { peerId: string };
            setRemotePeerId(peerJoinedMsg.peerId);

            webrtc.createDataChannel("fileTransfer");
            const offer = await webrtc.createOffer();

            const offerMessage: OfferMessage = {
              type: SignalingMessageType.OFFER,
              roomId: roomId!,
              offer,
              from: peerId,
            };
            signaling.sendMessage(offerMessage);
          }
        );

        signaling.onMessage(SignalingMessageType.OFFER, async (message) => {
          const offerMsg = message as OfferMessage;
          setRemotePeerId(offerMsg.from);

          const answer = await webrtc.createAnswer(offerMsg.offer);

          const answerMessage: AnswerMessage = {
            type: SignalingMessageType.ANSWER,
            roomId: roomId!,
            answer,
            from: peerId,
          };
          signaling.sendMessage(answerMessage);
        });

        signaling.onMessage(SignalingMessageType.ANSWER, async (message) => {
          const answerMsg = message as AnswerMessage;
          await webrtc.setRemoteDescription(answerMsg.answer);
        });

        signaling.onMessage(
          SignalingMessageType.ICE_CANDIDATE,
          async (message) => {
            const iceMsg = message as IceCandidateMessage;
            await webrtc.addIceCandidate(iceMsg.candidate);
          }
        );

        const joinMessage: JoinRoomMessage = {
          type: SignalingMessageType.JOIN_ROOM,
          roomId: roomId!,
          peerId,
        };
        signaling.sendMessage(joinMessage);
      } catch (error) {
        console.error("Connection error:", error);
        setError({
          type: "connection",
          message: error instanceof Error ? error.message : "Connection failed",
          timestamp: Date.now(),
        });
      }
    };

    if (roomId) {
      initializeConnection();
    }

    return () => {
      webrtc.close();
      signaling.disconnect();
    };
  }, []);

  useEffect(() => {
    if (fileTransfer.progress) {
      updateProgress(fileTransfer.progress);
    }
  }, [fileTransfer.progress, updateProgress]);

  useEffect(() => {
    if (fileTransfer.isSending) {
      setTransferState({ isActive: true, direction: "sending" });
    } else if (fileTransfer.isReceiving) {
      setTransferState({ isActive: true, direction: "receiving" });
    } else {
      setTransferState({ isActive: false, direction: null });
    }
  }, [fileTransfer.isSending, fileTransfer.isReceiving]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (webrtc.dataChannelState !== "open") {
        setError({
          type: "transfer",
          message:
            "Connection not established. Please wait for peer to connect.",
          timestamp: Date.now(),
        });
        return;
      }

      try {
        await fileTransfer.sendFile(file, webrtc.sendDataWithBackpressure, webrtc.getBufferedAmount);
      } catch (error) {
        setError({
          type: "transfer",
          message:
            error instanceof Error ? error.message : "File transfer failed",
          timestamp: Date.now(),
        });
      }
    },
    [webrtc, fileTransfer, setError]
  );

  const handleDisconnect = () => {
    webrtc.close();
    signaling.disconnect();
    setMode("home");
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-dark-text">Transfer Room</h1>
          <button
            onClick={handleDisconnect}
            className="bg-dark-error hover:bg-red-600 text-dark-text px-4 py-2 rounded-lg
                     transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>

        <ConnectionStatus state={connectionState} remotePeerId={remotePeerId} />

        {connectionState === "connected" ? (
          <div className="mt-6 space-y-6">
            {!transferState.isActive && (
              <FileDrop
                onFileSelect={handleFileSelect}
                disabled={transferState.isActive}
              />
            )}

            {transferState.isActive && transferState.progress && (
              <ProgressBar
                progress={transferState.progress}
                isSending={transferState.direction === "sending"}
              />
            )}

            {fileTransfer.receivedFile && (
              <div className="bg-dark-success bg-opacity-10 border border-dark-success rounded-xl p-6">
                <div className="text-center">
                  <div className="text-dark-success text-5xl mb-3">✓</div>
                  <p className="text-dark-success text-lg font-semibold mb-2">
                    File received successfully!
                  </p>
                  <p className="text-dark-muted text-sm">
                    {fileTransfer.receivedFile.metadata.name} has been
                    downloaded to your device.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            {/* Show QR code for room creator when waiting for peer */}
            {isRoomCreator && roomId && (
              <>
                <QRCodeDisplay
                  data={{
                    version: "1.0",
                    roomId,
                    signalingUrl:
                      import.meta.env.VITE_SIGNALING_URL ||
                      "ws://localhost:3001",
                    timestamp: Date.now(),
                  }}
                  roomId={roomId}
                />
                <div className="mt-6 bg-dark-surface border border-dark-border rounded-xl p-6">
                  <h3 className="text-dark-text font-semibold mb-3">
                    Waiting for peer...
                  </h3>
                  <p className="text-dark-muted text-sm">
                    Share the QR code or Room ID with the person you want to
                    connect with. Once they scan the code or enter the Room ID,
                    the connection will be established automatically.
                  </p>
                </div>
              </>
            )}
            {/* Show status for joiner */}
            {!isRoomCreator && (
              <div className="bg-dark-surface border border-dark-border rounded-xl p-6 text-center">
                <p className="text-dark-muted">
                  {connectionState === "connecting"
                    ? "Establishing connection..."
                    : "Waiting for connection..."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
