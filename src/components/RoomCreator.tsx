import { useEffect } from "react";
import { generateRoomId } from "../utils/roomId";
import { useAppContext } from "../hooks/useAppContext";

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
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-dark-text">
        {!roomId ? "Generating room..." : "Entering room..."}
      </div>
    </div>
  );
}
