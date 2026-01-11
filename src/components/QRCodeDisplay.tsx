import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { QRCodeData } from '../types/signaling';

interface QRCodeDisplayProps {
  data: QRCodeData;
  roomId: string;
}

export function QRCodeDisplay({ data, roomId }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const jsonString = JSON.stringify(data);
        const dataUrl = await QRCode.toDataURL(jsonString, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 256,
          color: {
            dark: '#FFFFFF',
            light: '#1E293B',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [data]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
      <h3 className="text-dark-text text-xl font-semibold mb-4 text-center">
        Scan to Connect
      </h3>

      {qrDataUrl && (
        <div className="flex justify-center mb-4">
          <div className="bg-dark-bg p-4 rounded-lg">
            <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
          </div>
        </div>
      )}

      <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
        <p className="text-dark-muted text-sm mb-2">Room ID:</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-dark-text font-mono text-sm bg-dark-surface px-3 py-2 rounded border border-dark-border">
            {roomId}
          </code>
          <button
            onClick={copyRoomId}
            className="bg-dark-accent hover:bg-blue-600 text-dark-text px-4 py-2 rounded
                     transition-colors duration-200 text-sm font-medium"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-dark-muted text-xs mt-2">
          Share this code manually if QR scanning is not available
        </p>
      </div>
    </div>
  );
}
