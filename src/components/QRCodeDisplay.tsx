import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, QrCode, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import type { QRCodeData } from '../types/signaling';
import { Button } from './ui';
import { cn } from './ui/utils';

interface QRCodeDisplayProps {
  data: QRCodeData;
  roomId: string;
}

export function QRCodeDisplay({ data, roomId }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const jsonString = JSON.stringify(data);
        const dataUrl = await QRCode.toDataURL(jsonString, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 300,
          color: {
            dark: '#FFFFFF',
            light: '#030712',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [data]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareRoom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'P2P Share Room',
          text: `Join my P2P Share room: ${roomId}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      copyRoomId();
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
          Scan to Connect
        </h3>
        <p className="text-dark-muted text-sm">
          Have your recipient scan this QR code
        </p>
      </div>

      {/* QR Code */}
      <div className="p-8 flex justify-center">
        <div className="relative">
          {/* Glow background */}
          <div
            className="absolute inset-0 blur-2xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            }}
          />

          {/* QR Code container with animated border */}
          <motion.div
            className="relative rounded-2xl p-1"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.5))',
            }}
            animate={{
              background: [
                'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.5))',
                'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.5))',
                'linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5))',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <div className="bg-dark-bg rounded-xl p-4">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-64 h-64 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 border-2 border-dark-accent border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                ) : qrDataUrl ? (
                  <motion.img
                    key="qr"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-64 h-64 rounded-lg"
                  />
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Corner decorations */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-dark-accent/50 rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-dark-accent/50 rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-dark-accent/50 rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-dark-accent/50 rounded-br-lg" />
        </div>
      </div>

      {/* Room ID section */}
      <div className="p-6 bg-dark-bg/30">
        <p className="text-dark-muted text-xs uppercase tracking-wider mb-3">
          Or share Room ID manually
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-dark-bg rounded-xl px-4 py-3 border border-dark-border">
            <code className="text-dark-text font-mono text-sm tracking-wide">
              {roomId}
            </code>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyRoomId}
            className={cn(
              'p-3 rounded-xl transition-colors',
              copied
                ? 'bg-dark-success/10 text-dark-success'
                : 'bg-dark-surface hover:bg-dark-surface-hover text-dark-muted hover:text-dark-text'
            )}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Share button (for mobile) */}
        {'share' in navigator && (
          <Button
            variant="secondary"
            className="w-full"
            icon={<Share2 className="w-4 h-4" />}
            onClick={shareRoom}
          >
            Share Room Link
          </Button>
        )}
      </div>
    </motion.div>
  );
}
