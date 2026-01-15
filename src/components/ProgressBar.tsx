import { cn } from "./ui/utils";
import { motion } from "framer-motion";
import type { ChunkProgress } from "../types/transfer";
import {
  ArrowUp,
  ArrowDown,
  Clock,
  Zap,
  HardDrive,
  Layers,
} from "lucide-react";
import {
  formatFileSize,
  formatSpeed,
  formatETA,
  formatPercentage,
} from "../utils/formatters";

interface ProgressBarProps {
  progress: ChunkProgress;
  isSending: boolean;
}

export function ProgressBar({ progress, isSending }: ProgressBarProps) {
  const percentage = Math.min(progress.percentage, 100);
  const isComplete = percentage >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
    >
      {/* Glass card container */}
      <div className="glass-strong rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Direction indicator */}
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isSending ? "bg-dark-accent/10" : "bg-dark-success/10"
              )}
            >
              {isSending ? (
                <ArrowUp className="w-5 h-5 text-dark-accent" />
              ) : (
                <ArrowDown className="w-5 h-5 text-dark-success" />
              )}
            </div>

            <div>
              <h3 className="text-dark-text font-semibold">
                {isSending ? "Sending File" : "Receiving File"}
              </h3>
              <p className="text-dark-muted text-sm">
                {isComplete ? "Transfer complete" : "Transfer in progress..."}
              </p>
            </div>
          </div>

          {/* Percentage badge */}
          <div
            className={cn(
              "px-4 py-2 rounded-xl font-mono font-semibold text-lg",
              isComplete
                ? "bg-dark-success/10 text-dark-success"
                : "bg-dark-accent/10 text-dark-accent"
            )}
          >
            {formatPercentage(percentage)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mb-6">
          {/* Background track */}
          <div className="h-3 bg-dark-bg rounded-full overflow-hidden">
            {/* Progress fill */}
            <motion.div
              className="h-full rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                background: isComplete
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
                backgroundSize: "200% 100%",
              }}
            >
              {/* Shimmer effect */}
              {!isComplete && (
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    }}
                  />
                </div>
              )}

              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: isComplete
                    ? "0 0 20px rgba(16, 185, 129, 0.5)"
                    : "0 0 20px rgba(59, 130, 246, 0.5)",
                }}
              />
            </motion.div>
          </div>

          {/* Progress indicator dot */}
          {!isComplete && percentage > 0 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg"
              style={{ left: `calc(${percentage}% - 10px)` }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Progress */}
          <div className="bg-dark-bg/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-dark-muted mb-2">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Progress</span>
            </div>
            <p className="text-dark-text font-mono text-sm">
              {formatFileSize(progress.bytesTransferred)}
              <span className="text-dark-subtle"> / </span>
              {formatFileSize(progress.totalBytes)}
            </p>
          </div>

          {/* Chunks */}
          <div className="bg-dark-bg/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-dark-muted mb-2">
              <Layers className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Chunks</span>
            </div>
            <p className="text-dark-text font-mono text-sm">
              {progress.chunksTransferred.toLocaleString()}
              <span className="text-dark-subtle"> / </span>
              {progress.totalChunks.toLocaleString()}
            </p>
          </div>

          {/* Speed */}
          <div className="bg-dark-bg/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-dark-muted mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Speed</span>
            </div>
            <p className="text-dark-text font-mono text-sm">
              {formatSpeed(progress.speed)}
            </p>
          </div>

          {/* ETA */}
          <div className="bg-dark-bg/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-dark-muted mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">ETA</span>
            </div>
            <p className="text-dark-text font-mono text-sm">
              {isComplete ? "Done!" : formatETA(progress.eta)}
            </p>
          </div>
        </div>

        {/* Transfer visualization (optional: animated dots) */}
        {!isComplete && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full",
                  isSending ? "bg-dark-accent" : "bg-dark-success"
                )}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
