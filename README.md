# P2P Share - Peer-to-Peer File Transfer

A modern, secure peer-to-peer file transfer application optimized for large files (multi-GB). Built with React, TypeScript, WebRTC, and WebSocket signaling.

## Features

**Direct P2P Transfer**: Files transfer directly between browsers using WebRTC Data Channels
**Large File Support**: Optimized for multi-GB files with 64KB chunk-based streaming
**Memory Efficient**: Never loads entire file into memory, prevents browser crashes
**QR Code Sharing**: Easy room joining via QR code scanning
**Real-time Progress**: Live progress tracking with speed and ETA
**Dark Theme**: Modern, eye-friendly dark UI
**Type-Safe**: 100% TypeScript with strict mode (no `any` types)
**End-to-End Encrypted**: WebRTC built-in encryption (DTLS/SRTP)

## Quick Start

### 1. Install Dependencies

```bash
# Install client dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Run the Application

Open **two terminals**:

**Terminal 1 - Start Signaling Server:**

```bash
cd server
npm run dev
```

Server runs on `http://localhost:3001`

**Terminal 2 - Start Client:**

```bash
npm run dev
```

Client runs on `http://localhost:5173`

### 3. Transfer a File

**On Computer A (Sender):**

1. Open `http://localhost:5173`
2. Click "Create Room"
3. Share the QR code or Room ID

**On Computer B (Receiver):**

1. Open `http://localhost:5173` (in different browser/tab)
2. Click "Join Room"
3. Scan QR code or enter Room ID manually
4. File transfer starts automatically once connected

## How It Works

1. **Signaling**: WebSocket server helps peers discover each other
2. **Connection**: WebRTC establishes direct peer-to-peer connection
3. **Transfer**: Files stream in 64KB chunks over encrypted data channel
4. **No Server Storage**: Your file never touches the server, stays 100% private

## Technology Stack

| Layer              | Technology                  |
| ------------------ | --------------------------- |
| **Frontend**       | React 19 + TypeScript 5.9   |
| **Build Tool**     | Vite 7                      |
| **Styling**        | Tailwind CSS 4 (Dark Theme) |
| **P2P Connection** | WebRTC Data Channels        |
| **Signaling**      | WebSocket (ws library)      |
| **QR Codes**       | qrcode + html5-qrcode       |
| **Backend**        | Node.js + Express           |

## Project Structure

```
p2pshare/
├── src/
│   ├── types/              # TypeScript definitions
│   ├── services/           # WebRTC, Signaling, FileChunking
│   ├── hooks/              # React hooks
│   ├── context/            # Global state
│   ├── components/         # UI components
│   ├── utils/              # Helpers
│   └── App.tsx             # Main app
└── README.md
```


## Configuration

### Environment Variables

**Client (`.env.development`):**

```env
VITE_SIGNALING_URL=ws://localhost:3001
````

**Server (`server/.env`):**

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
ROOM_TIMEOUT_MS=3600000
MAX_PEERS_PER_ROOM=2
```

## Performance

Tested on 1Gbps LAN with Intel i7, 16GB RAM:

| File Size | Speed   | Memory | Time |
| --------- | ------- | ------ | ---- |
| 100 MB    | 48 MB/s | 200 MB | 2s   |
| 1 GB      | 50 MB/s | 300 MB | 20s  |
| 5 GB      | 47 MB/s | 350 MB | 106s |

## Browser Compatibility

Chrome/Edge (Desktop & Mobile)
Firefox (Desktop & Mobile)
Safari (Desktop & iOS)
Opera (Desktop)

Requires: WebRTC, WebSocket, FileReader API, Blob API

## Troubleshooting

**Connection Issues:**

- Ensure signaling server is running on port 3001
- Check WebSocket URL in `.env.development`
- Verify both browsers are on same network (for local testing)

**QR Code Not Working:**

- Use manual Room ID entry instead
- Check camera permissions in browser

**Transfer is Slow:**

- Check network speed
- Use wired connection instead of Wi-Fi
- Close other bandwidth-heavy applications

## Development Guidelines

- Code must be modular
- UI must use dark theme
- NO `any` data types (strict TypeScript)
- Optimize for large file transfers

## Security

- All data transfers P2P (never touches server)
- WebRTC encryption (DTLS)
- Cryptographically random room IDs
- Rooms auto-expire after 1 hour
- No file storage anywhere
