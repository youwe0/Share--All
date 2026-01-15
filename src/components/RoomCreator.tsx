import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import { generateRoomId } from "../utils/roomId";
import { useAppContext } from "../hooks/useAppContext";
import { GridBackground, HeroGlow } from "./ui";

export function RoomCreator() {
  const { roomId, setRoomId, setMode, setIsRoomCreator } = useAppContext();

  useEffect(() => {
    if (!roomId) {
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      setIsRoomCreator(true); // Mark this user as the room creator
      // Once room ID is set, immediately switch to room mode to establish connection
      setTimeout(() => setMode("room"), 0);
    }
  }, [roomId, setRoomId, setMode, setIsRoomCreator]);

  // Show loading while generating room or transitioning to room view
  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <HeroGlow />
      <GridBackground variant="dots" fade className="absolute inset-0" />

      {/* Loading content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        {/* Animated logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative inline-flex items-center justify-center w-20 h-20 mb-6"
        >
          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-dark-accent/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-dark-accent/10"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />

          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-accent to-dark-gradient-mid flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-dark-text mb-2">
            {!roomId ? "Creating Room" : "Entering Room"}
          </h2>
          <p className="text-dark-muted text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {!roomId ? "Generating secure room ID..." : "Setting up connection..."}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
