import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/HomePage';
import { RoomCreator } from './components/RoomCreator';
import { RoomJoiner } from './components/RoomJoiner';
import { Room } from './components/Room';
import { useAppContext } from './hooks/useAppContext';

function AppContent() {
  const { mode, error } = useAppContext();

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-dark-error bg-opacity-90 border border-dark-error
                      text-dark-text rounded-lg p-4 max-w-md shadow-lg z-50">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {mode === 'home' && <HomePage />}
      {mode === 'create' && <RoomCreator />}
      {mode === 'join' && <RoomJoiner />}
      {mode === 'room' && <Room />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
