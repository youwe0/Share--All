import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Download, Zap, Users, Send } from "lucide-react";
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
import { Button, Card, GridBackground, HeroGlow } from "./ui";
import { formatFileSize } from "../utils/formatters";

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
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background effects */}
      <HeroGlow />
      <GridBackground variant="dots" fade className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Leave
              </Button>
              <div className="h-6 w-px bg-dark-border" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dark-accent to-dark-gradient-mid flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-dark-text">Transfer Room</h1>
                  <p className="text-dark-muted text-sm">Room: {roomId?.slice(0, 8)}...</p>
                </div>
              </div>
            </div>

            {/* Connection status badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                ${connectionState === 'connected'
                  ? 'bg-dark-success/10 text-dark-success border border-dark-success/30'
                  : connectionState === 'connecting'
                    ? 'bg-dark-warning/10 text-dark-warning border border-dark-warning/30'
                    : 'bg-dark-surface text-dark-muted border border-dark-border'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-dark-success' :
                connectionState === 'connecting' ? 'bg-dark-warning animate-pulse' :
                'bg-dark-muted'
              }`} />
              {connectionState === 'connected' ? 'Connected' :
               connectionState === 'connecting' ? 'Connecting...' :
               'Waiting'}
            </motion.div>
          </motion.div>

          {/* Main content area */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column - Connection status & info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              <ConnectionStatus state={connectionState} remotePeerId={remotePeerId} />

              {/* Room info card */}
              <Card variant="glass" className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-dark-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-dark-accent" />
                  </div>
                  <div>
                    <h3 className="text-dark-text font-medium">Room Status</h3>
                    <p className="text-dark-muted text-sm">
                      {remotePeerId ? '2 peers connected' : 'Waiting for peer'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-muted">Your role</span>
                    <span className="text-dark-text font-medium flex items-center gap-1.5">
                      {isRoomCreator ? (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Sender
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Receiver
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-muted">Transfer mode</span>
                    <span className="text-dark-text font-medium">P2P Direct</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-muted">Encryption</span>
                    <span className="text-dark-success font-medium">DTLS Enabled</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Right column - Main transfer area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <AnimatePresence mode="wait">
                {connectionState === "connected" ? (
                  <motion.div
                    key="connected"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* File drop or progress */}
                    {!transferState.isActive && !fileTransfer.receivedFile && (
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

                    {/* Success state */}
                    {fileTransfer.receivedFile && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-strong rounded-2xl overflow-hidden"
                      >
                        {/* Success header */}
                        <div className="p-8 text-center relative">
                          {/* Glow effect */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: 'radial-gradient(ellipse at center top, rgba(16, 185, 129, 0.15) 0%, transparent 60%)',
                            }}
                          />

                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                            className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-success/10 mb-6"
                          >
                            <motion.div
                              className="absolute inset-0 rounded-full bg-dark-success/20"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <CheckCircle2 className="w-10 h-10 text-dark-success relative z-10" />
                          </motion.div>

                          <h2 className="text-2xl font-bold text-dark-text mb-2">
                            Transfer Complete!
                          </h2>
                          <p className="text-dark-muted">
                            Your file has been received and downloaded successfully.
                          </p>
                        </div>

                        {/* File details */}
                        <div className="px-8 pb-8">
                          <div className="bg-dark-bg/50 rounded-xl p-5 border border-dark-border">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-xl bg-dark-success/10 flex items-center justify-center flex-shrink-0">
                                <Download className="w-7 h-7 text-dark-success" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-dark-text font-semibold text-lg truncate">
                                  {fileTransfer.receivedFile.metadata.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-sm text-dark-muted">
                                  <span>{formatFileSize(fileTransfer.receivedFile.metadata.size)}</span>
                                  <span className="w-1 h-1 rounded-full bg-dark-border" />
                                  <span>{fileTransfer.receivedFile.metadata.type || 'Unknown type'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-3 mt-6">
                            <Button
                              variant="secondary"
                              className="flex-1"
                              onClick={() => {
                                // Reset for another transfer
                                fileTransfer.reset?.();
                              }}
                            >
                              Receive Another
                            </Button>
                            <Button
                              variant="primary"
                              className="flex-1"
                              onClick={handleDisconnect}
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Show QR code for room creator when waiting for peer */}
                    {isRoomCreator && roomId && (
                      <div className="space-y-6">
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

                        <Card variant="default" className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-dark-accent/10 flex items-center justify-center flex-shrink-0">
                              <Users className="w-5 h-5 text-dark-accent" />
                            </div>
                            <div>
                              <h3 className="text-dark-text font-semibold mb-2">
                                Waiting for peer to connect...
                              </h3>
                              <p className="text-dark-muted text-sm leading-relaxed">
                                Share the QR code or Room ID with the person you want to
                                connect with. Once they scan the code or enter the Room ID,
                                the connection will be established automatically.
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Show status for joiner */}
                    {!isRoomCreator && (
                      <Card variant="glass" className="p-10 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-dark-accent border-t-transparent"
                        />
                        <h3 className="text-xl font-semibold text-dark-text mb-2">
                          {connectionState === "connecting"
                            ? "Establishing Connection"
                            : "Waiting for Connection"}
                        </h3>
                        <p className="text-dark-muted">
                          {connectionState === "connecting"
                            ? "Setting up secure peer-to-peer connection..."
                            : "Waiting for the sender to be ready..."}
                        </p>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
