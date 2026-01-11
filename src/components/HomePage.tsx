import { useAppContext } from "../hooks/useAppContext";

export function HomePage() {
  const { setMode } = useAppContext();

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-dark-text mb-4">P2P Share</h1>
          <p className="text-dark-muted text-lg">
            Securely transfer large files directly between browsers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode("create")}
            className="bg-dark-surface border-2 border-dark-accent hover:bg-dark-accent hover:bg-opacity-10
                     rounded-xl p-8 transition-all duration-200 group"
          >
            <div className="text-dark-accent text-5xl mb-4">+</div>
            <h2 className="text-dark-text text-2xl font-semibold mb-2">
              Create Room
            </h2>
            <p className="text-dark-muted">
              Generate a QR code and share files with others
            </p>
          </button>

          <button
            onClick={() => setMode("join")}
            className="bg-dark-surface border-2 border-dark-success hover:bg-dark-success hover:bg-opacity-10
                     rounded-xl p-8 transition-all duration-200 group"
          >
            <div className="text-dark-success text-5xl mb-4">⌖</div>
            <h2 className="text-dark-text text-2xl font-semibold mb-2">
              Join Room
            </h2>
            <p className="text-dark-muted">
              Scan a QR code to connect and receive files
            </p>
          </button>
        </div>

        <div className="mt-12 bg-dark-surface border border-dark-border rounded-xl p-6">
          <h3 className="text-dark-text font-semibold mb-3">Features</h3>
          <ul className="space-y-2 text-dark-muted">
            <li className="flex items-start">
              <span className="text-dark-success mr-2">✓</span>
              <span>Direct peer-to-peer transfer (no server storage)</span>
            </li>
            <li className="flex items-start">
              <span className="text-dark-success mr-2">✓</span>
              <span>Support for large files (multi-GB)</span>
            </li>
            <li className="flex items-start">
              <span className="text-dark-success mr-2">✓</span>
              <span>End-to-end encrypted with WebRTC</span>
            </li>
            <li className="flex items-start">
              <span className="text-dark-success mr-2">✓</span>
              <span>Real-time progress tracking</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
