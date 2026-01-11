interface ConnectionStatusProps {
  state: RTCPeerConnectionState;
  remotePeerId?: string | null;
}

export function ConnectionStatus({ state, remotePeerId }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (state) {
      case 'connected':
        return 'bg-dark-success';
      case 'connecting':
        return 'bg-dark-warning';
      case 'failed':
      case 'disconnected':
      case 'closed':
        return 'bg-dark-error';
      default:
        return 'bg-dark-muted';
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'failed':
        return 'Connection Failed';
      case 'disconnected':
        return 'Disconnected';
      case 'closed':
        return 'Connection Closed';
      default:
        return 'Not Connected';
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
        <div className="flex-1">
          <p className="text-dark-text font-medium">{getStatusText()}</p>
          {remotePeerId && state === 'connected' && (
            <p className="text-dark-muted text-sm">Peer: {remotePeerId.slice(0, 8)}...</p>
          )}
        </div>
        {state === 'connecting' && (
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-dark-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-dark-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-dark-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
