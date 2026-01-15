import { cn } from './ui/utils';
import { Badge } from './ui';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2, CheckCircle2, AlertCircle, User } from 'lucide-react';

interface ConnectionStatusProps {
  state: RTCPeerConnectionState;
  remotePeerId?: string | null;
}

const stateConfig: Record<
  RTCPeerConnectionState,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: typeof Wifi;
    pulse: boolean;
  }
> = {
  new: {
    label: 'Initializing',
    color: 'text-dark-muted',
    bgColor: 'bg-dark-muted/10',
    icon: Loader2,
    pulse: true,
  },
  connecting: {
    label: 'Connecting',
    color: 'text-dark-warning',
    bgColor: 'bg-dark-warning/10',
    icon: Wifi,
    pulse: true,
  },
  connected: {
    label: 'Connected',
    color: 'text-dark-success',
    bgColor: 'bg-dark-success/10',
    icon: CheckCircle2,
    pulse: false,
  },
  disconnected: {
    label: 'Disconnected',
    color: 'text-dark-error',
    bgColor: 'bg-dark-error/10',
    icon: WifiOff,
    pulse: false,
  },
  failed: {
    label: 'Connection Failed',
    color: 'text-dark-error',
    bgColor: 'bg-dark-error/10',
    icon: AlertCircle,
    pulse: false,
  },
  closed: {
    label: 'Connection Closed',
    color: 'text-dark-muted',
    bgColor: 'bg-dark-muted/10',
    icon: WifiOff,
    pulse: false,
  },
};

export function ConnectionStatus({ state, remotePeerId }: ConnectionStatusProps) {
  const config = stateConfig[state] || stateConfig.new;
  const Icon = config.icon;
  const isConnected = state === 'connected';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        {/* Connection status */}
        <div className="flex items-center gap-3">
          {/* Status icon with animation */}
          <div className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center', config.bgColor)}>
            <Icon
              className={cn(
                'w-5 h-5',
                config.color,
                config.pulse && 'animate-pulse',
                state === 'new' && 'animate-spin'
              )}
            />

            {/* Pulse rings for connecting state */}
            {state === 'connecting' && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-xl border border-dark-warning/30"
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-xl border border-dark-warning/20"
                  animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}

            {/* Success glow for connected state */}
            {isConnected && (
              <div
                className="absolute inset-0 rounded-xl"
                style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={cn('font-medium', config.color)}>
                {config.label}
              </span>
              {isConnected && (
                <Badge variant="success" dot pulse>
                  Live
                </Badge>
              )}
            </div>
            <p className="text-dark-subtle text-sm">
              {isConnected
                ? 'Peer-to-peer connection established'
                : state === 'connecting'
                  ? 'Establishing secure connection...'
                  : 'Waiting for connection'}
            </p>
          </div>
        </div>

        {/* Remote peer info */}
        {remotePeerId && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-dark-bg/50 rounded-lg px-3 py-2"
          >
            <div className="w-8 h-8 rounded-full bg-dark-accent/10 flex items-center justify-center">
              <User className="w-4 h-4 text-dark-accent" />
            </div>
            <div className="text-right">
              <p className="text-dark-muted text-xs">Connected Peer</p>
              <p className="text-dark-text text-sm font-mono">
                {remotePeerId.slice(0, 8)}...
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Connection quality indicator (when connected) */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-dark-border/50"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-muted">Connection Quality</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((bar) => (
                <motion.div
                  key={bar}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: bar * 0.1 }}
                  className={cn(
                    'w-1 rounded-full origin-bottom',
                    bar <= 4 ? 'bg-dark-success' : 'bg-dark-border'
                  )}
                  style={{ height: `${bar * 4 + 4}px` }}
                />
              ))}
              <span className="text-dark-success text-xs ml-2">Excellent</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
