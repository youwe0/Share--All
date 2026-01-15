import { motion } from 'framer-motion';
import { ArrowLeft, Download, Shield, Zap, Lock } from 'lucide-react';
import { QRCodeScanner } from './QRCodeScanner';
import type { QRCodeData } from '../types/signaling';
import { useAppContext } from '../hooks/useAppContext';
import { Button, Card, GridBackground, HeroGlow } from './ui';

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
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background effects */}
      <HeroGlow />
      <GridBackground variant="dots" fade className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
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
                onClick={() => setMode('home')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <div className="h-6 w-px bg-dark-border" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dark-gradient-mid to-dark-gradient-end flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-dark-text">Receive File</h1>
                  <p className="text-dark-muted text-sm">Join a transfer room</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Scanner - takes more space */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <QRCodeScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            </motion.div>

            {/* Info sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* How to join card */}
              <Card variant="default" className="p-6">
                <h3 className="text-dark-text font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-dark-accent/10 flex items-center justify-center text-xs text-dark-accent font-bold">?</span>
                  How to join
                </h3>
                <ol className="text-dark-muted text-sm space-y-4">
                  {[
                    'Click "Start Camera" to activate your camera',
                    'Point your camera at the QR code shared by the sender',
                    'Or click "Enter Room ID Manually" if you have the code',
                    'Connection will be established automatically',
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-dark-surface flex items-center justify-center text-xs text-dark-accent font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>

              {/* Security info */}
              <Card variant="glass" className="p-5">
                <h4 className="text-dark-text font-medium mb-4">Security Features</h4>
                <div className="space-y-3">
                  {[
                    { icon: Shield, label: 'End-to-end encrypted' },
                    { icon: Lock, label: 'Direct peer connection' },
                    { icon: Zap, label: 'No server storage' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-dark-success/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-dark-success" />
                      </div>
                      <span className="text-dark-muted">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
