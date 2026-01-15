import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle2, HardDrive } from "lucide-react";
import { formatFileSize } from "../utils/formatters";
import { cn } from "./ui/utils";

interface FileDropProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDrop({ onFileSelect, disabled = false }: FileDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎬";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📄";
    if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
      return "📦";
    return "📁";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative rounded-2xl overflow-hidden cursor-pointer",
          "transition-all duration-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Background with grid pattern */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            isDragging ? "opacity-100" : "opacity-50"
          )}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Main drop area */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-10",
            "transition-all duration-300",
            isDragging
              ? "border-dark-accent bg-dark-accent/5 scale-[1.02]"
              : "border-dark-border hover:border-dark-accent/50 hover:bg-dark-surface/50",
            selectedFile && "border-dark-success/50 bg-dark-success/5"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="selected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                {/* Success indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative mb-6"
                >
                  <div className="w-20 h-20 rounded-2xl bg-dark-success/10 flex items-center justify-center">
                    <span className="text-4xl">
                      {getFileTypeIcon(selectedFile.type)}
                    </span>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-dark-success flex items-center justify-center shadow-glow-success"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.div>

                {/* File info */}
                <div className="text-center mb-4">
                  <p className="text-dark-text font-semibold text-lg mb-1 max-w-xs truncate">
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-dark-muted text-sm">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      {formatFileSize(selectedFile.size)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-dark-border" />
                    <span>
                      {new Date(selectedFile.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Change file button */}
                {!disabled && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearFile}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-dark-muted hover:text-dark-text hover:bg-dark-surface transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Choose different file</span>
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                {/* Upload icon with animation */}
                <motion.div
                  animate={
                    isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }
                  }
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative mb-6"
                >
                  <div
                    className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-300",
                      isDragging ? "bg-dark-accent/20" : "bg-dark-surface"
                    )}
                  >
                    <Upload
                      className={cn(
                        "w-8 h-8 transition-colors duration-300",
                        isDragging ? "text-dark-accent" : "text-dark-muted"
                      )}
                    />
                  </div>

                  {/* Animated rings when dragging */}
                  {isDragging && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-dark-accent/30"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-dark-accent/20"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.3,
                        }}
                      />
                    </>
                  )}
                </motion.div>

                {/* Text */}
                <div className="text-center">
                  <p className="text-dark-text font-semibold text-lg mb-2">
                    {isDragging
                      ? "Drop your file here"
                      : "Drop a file or click to browse"}
                  </p>
                  <p className="text-dark-muted text-sm">
                    {isDragging
                      ? "Release to select this file"
                      : "Supports files of any size"}
                  </p>
                </div>

                {/* File type hints */}
                <div className="flex items-center gap-3 mt-6 text-dark-subtle text-xs">
                  <span>Documents</span>
                  <span className="w-1 h-1 rounded-full bg-dark-border" />
                  <span>Images</span>
                  <span className="w-1 h-1 rounded-full bg-dark-border" />
                  <span>Videos</span>
                  <span className="w-1 h-1 rounded-full bg-dark-border" />
                  <span>Archives</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Glow effect when dragging */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                boxShadow: "inset 0 0 60px rgba(59, 130, 246, 0.1)",
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
