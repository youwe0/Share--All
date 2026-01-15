import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, AlertCircle, Hash, QrCode, ArrowRight } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import type { QRCodeData } from '../types/signaling';
import { isQRCodeData } from '../utils/validation';
import { Button } from './ui';

interface QRCodeScannerProps {
  onScanSuccess: (data: QRCodeData) => void;
  onScanError?: (error: string) => void;
}

export function QRCodeScanner({ onScanSuccess, onScanError }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [useManual, setUseManual] = useState(false);
  const [manualRoomId, setManualRoomId] = useState('');

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleQRCodeData(decodedText);
          scanner.stop().catch(console.error);
          setIsScanning(false);
        },
        (errorMessage) => {
          console.log('QR scan error:', errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start camera';
      setError(errorMsg);
      if (onScanError) {
        onScanError(errorMsg);
      }
    }
  };

  const handleQRCodeData = (rawData: string) => {
    try {
      const parsed: unknown = JSON.parse(rawData);

      if (isQRCodeData(parsed)) {
        onScanSuccess(parsed);
      } else {
        const errorMsg = 'Invalid QR code format';
        setError(errorMsg);
        if (onScanError) {
          onScanError(errorMsg);
        }
      }
    } catch {
      const errorMsg = 'Invalid QR code data';
      setError(errorMsg);
      if (onScanError) {
        onScanError(errorMsg);
      }
    }
  };

  const handleManualEntry = () => {
    if (manualRoomId.trim()) {
      const signalingUrl = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:3001';
      const qrData: QRCodeData = {
        version: '1.0',
        roomId: manualRoomId.trim(),
        signalingUrl,
        timestamp: Date.now(),
      };
      onScanSuccess(qrData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 text-center border-b border-dark-border/50">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-dark-accent/10 mb-4">
          <QrCode className="w-6 h-6 text-dark-accent" />
        </div>
        <h3 className="text-xl font-semibold text-dark-text mb-1">
          Scan QR Code
        </h3>
        <p className="text-dark-muted text-sm">
          Point your camera at the sender's QR code
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {!useManual ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* QR Scanner container */}
              <div className="relative mb-6">
                <div
                  id="qr-reader"
                  className="rounded-xl overflow-hidden bg-dark-bg/50"
                  style={{ minHeight: isScanning ? '300px' : '0' }}
                />

                {/* Scanner overlay when not active */}
                {!isScanning && (
                  <div className="bg-dark-bg/50 rounded-xl p-10 border-2 border-dashed border-dark-border flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-dark-surface flex items-center justify-center mb-4">
                      <Camera className="w-8 h-8 text-dark-muted" />
                    </div>
                    <p className="text-dark-muted text-sm text-center">
                      Click the button below to activate your camera
                    </p>
                  </div>
                )}

                {/* Scanning indicator */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Corner brackets */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-dark-accent rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-dark-accent rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-dark-accent rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-dark-accent rounded-br-lg" />

                    {/* Scanning line animation */}
                    <motion.div
                      className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-dark-accent to-transparent"
                      animate={{ top: ['20%', '80%', '20%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                )}
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="bg-dark-error/10 border border-dark-error/30 text-dark-error rounded-xl p-4 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="space-y-3">
                {!isScanning ? (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={startScanning}
                    icon={<Camera className="w-4 h-4" />}
                  >
                    Start Camera
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => {
                      if (scannerRef.current) {
                        scannerRef.current.stop().catch(console.error);
                        setIsScanning(false);
                      }
                    }}
                    icon={<CameraOff className="w-4 h-4" />}
                  >
                    Stop Camera
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setUseManual(true)}
                  icon={<Hash className="w-4 h-4" />}
                >
                  Enter Room ID Manually
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Manual entry form */}
              <div className="mb-6">
                <label className="block text-dark-muted text-sm mb-2 font-medium">
                  Room ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
                  <input
                    type="text"
                    value={manualRoomId}
                    onChange={(e) => setManualRoomId(e.target.value)}
                    placeholder="Enter the room ID shared with you"
                    className="w-full bg-dark-bg border border-dark-border text-dark-text
                             rounded-xl pl-12 pr-4 py-4 focus:border-dark-accent focus:ring-2
                             focus:ring-dark-accent/20 outline-none transition-all
                             placeholder:text-dark-subtle font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleManualEntry();
                      }
                    }}
                  />
                </div>
                <p className="text-dark-subtle text-xs mt-2">
                  The room ID is usually a 21-character alphanumeric string
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleManualEntry}
                  disabled={!manualRoomId.trim()}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Join Room
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setUseManual(false)}
                  icon={<QrCode className="w-4 h-4" />}
                >
                  Use QR Scanner Instead
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
