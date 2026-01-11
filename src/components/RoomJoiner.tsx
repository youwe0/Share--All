import { QRCodeScanner } from './QRCodeScanner';
import type { QRCodeData } from '../types/signaling';
import { useAppContext } from '../hooks/useAppContext';

export function RoomJoiner() {
  const { setRoomId, setMode, setIsRoomCreator } = useAppContext();

  const handleScanSuccess = (data: QRCodeData) => {
    setRoomId(data.roomId);
    setIsRoomCreator(false); // Mark this user as joining (not creating)
    // Immediately switch to room mode to initiate connection
    setMode('room');
  };

  const handleScanError = (error: string) => {
    console.error('QR scan error:', error);
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-dark-text">Join Room</h1>
          <button
            onClick={() => setMode('home')}
            className="text-dark-muted hover:text-dark-text transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="mt-6">
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />

          <div className="mt-6 bg-dark-surface border border-dark-border rounded-xl p-6">
            <h3 className="text-dark-text font-semibold mb-3">How to join:</h3>
            <ol className="text-dark-muted text-sm space-y-2 list-decimal list-inside">
              <li>Click "Start Camera" to activate your camera</li>
              <li>Point your camera at the QR code shared by the room creator</li>
              <li>Or click "Enter Room ID Manually" if you have the Room ID</li>
              <li>Connection will be established automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
