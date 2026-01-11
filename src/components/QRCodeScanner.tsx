import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import type { QRCodeData } from '../types/signaling';
import { isQRCodeData } from '../utils/validation';

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
    } catch (err) {
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
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
      <h3 className="text-dark-text text-xl font-semibold mb-4 text-center">
        Join Room
      </h3>

      {!useManual ? (
        <>
          <div id="qr-reader" className="mb-4 rounded-lg overflow-hidden"></div>

          {error && (
            <div className="bg-dark-error bg-opacity-10 border border-dark-error text-dark-error rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {!isScanning ? (
            <button
              onClick={startScanning}
              className="w-full bg-dark-success hover:bg-green-600 text-dark-text font-semibold
                       py-3 px-6 rounded-lg transition-colors duration-200 mb-3"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={() => {
                if (scannerRef.current) {
                  scannerRef.current.stop().catch(console.error);
                  setIsScanning(false);
                }
              }}
              className="w-full bg-dark-error hover:bg-red-600 text-dark-text font-semibold
                       py-3 px-6 rounded-lg transition-colors duration-200 mb-3"
            >
              Stop Camera
            </button>
          )}

          <button
            onClick={() => setUseManual(true)}
            className="w-full bg-dark-bg border border-dark-border hover:border-dark-accent
                     text-dark-text py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Enter Room ID Manually
          </button>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-dark-muted text-sm mb-2">Room ID:</label>
            <input
              type="text"
              value={manualRoomId}
              onChange={(e) => setManualRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="w-full bg-dark-bg border border-dark-border text-dark-text
                       rounded-lg px-4 py-3 focus:border-dark-accent focus:ring-1
                       focus:ring-dark-accent outline-none transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleManualEntry();
                }
              }}
            />
          </div>

          <button
            onClick={handleManualEntry}
            disabled={!manualRoomId.trim()}
            className="w-full bg-dark-success hover:bg-green-600 text-dark-text font-semibold
                     py-3 px-6 rounded-lg transition-colors duration-200 mb-3
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Room
          </button>

          <button
            onClick={() => setUseManual(false)}
            className="w-full bg-dark-bg border border-dark-border hover:border-dark-accent
                     text-dark-text py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Use QR Scanner
          </button>
        </>
      )}
    </div>
  );
}
