import type { ChunkProgress } from '../types/transfer';
import { formatFileSize, formatSpeed, formatETA, formatPercentage } from '../utils/formatters';

interface ProgressBarProps {
  progress: ChunkProgress;
  isSending: boolean;
}

export function ProgressBar({ progress, isSending }: ProgressBarProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-dark-text font-semibold">
            {isSending ? 'Sending' : 'Receiving'}
          </span>
          <span className="text-dark-accent font-semibold">
            {formatPercentage(progress.percentage)}
          </span>
        </div>

        <div className="w-full bg-dark-bg rounded-full h-3 overflow-hidden">
          <div
            className="bg-dark-accent h-full rounded-full transition-all bg-white duration-300 ease-out
                     relative overflow-hidden"
            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent
                       opacity-30 animate-shimmer"
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-dark-muted mb-1">Progress</p>
          <p className="text-dark-text font-mono">
            {formatFileSize(progress.bytesTransferred)} / {formatFileSize(progress.totalBytes)}
          </p>
        </div>

        <div>
          <p className="text-dark-muted mb-1">Chunks</p>
          <p className="text-dark-text font-mono">
            {progress.chunksTransferred} / {progress.totalChunks}
          </p>
        </div>

        <div>
          <p className="text-dark-muted mb-1">Speed</p>
          <p className="text-dark-text font-mono">{formatSpeed(progress.speed)}</p>
        </div>

        <div>
          <p className="text-dark-muted mb-1">ETA</p>
          <p className="text-dark-text font-mono">{formatETA(progress.eta)}</p>
        </div>
      </div>
    </div>
  );
}
