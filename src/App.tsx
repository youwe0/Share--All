import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/HomePage';
import { RoomCreator } from './components/RoomCreator';
import { RoomJoiner } from './components/RoomJoiner';
import { Room } from './components/Room';
import { useAppContext } from './hooks/useAppContext';

function AppContent() {
  const { mode, error, setError } = useAppContext();

  return (
    <>
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div className="glass-strong rounded-xl overflow-hidden shadow-2xl border border-dark-error/30">
              {/* Error glow effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at top right, rgba(239, 68, 68, 0.15) 0%, transparent 60%)',
                }}
              />

              <div className="relative p-4 flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-dark-error/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-dark-error" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-semibold text-dark-text mb-1">
                    {error.type === 'connection' ? 'Connection Error' :
                     error.type === 'transfer' ? 'Transfer Error' : 'Error'}
                  </p>
                  <p className="text-dark-muted text-sm leading-relaxed">
                    {error.message}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setError(null)}
                  className="p-1.5 rounded-lg hover:bg-dark-surface text-dark-muted hover:text-dark-text transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar for auto-dismiss */}
              <motion.div
                className="h-0.5 bg-dark-error/50"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                onAnimationComplete={() => setError(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page transitions */}
      <AnimatePresence mode="wait">
        {mode === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HomePage />
          </motion.div>
        )}
        {mode === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RoomCreator />
          </motion.div>
        )}
        {mode === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RoomJoiner />
          </motion.div>
        )}
        {mode === 'room' && (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Room />
          </motion.div>
        )}
      </AnimatePresence>
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
