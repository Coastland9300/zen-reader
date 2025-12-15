import React, { useEffect } from 'react';
import { useStore } from './store';
import { Library } from './components/Library';
import { PDFReader } from './components/PDFReader';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const { currentView, settings } = useStore();

  // Handle Dark Mode
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Default to system preference if user hasn't explicitly toggled (or handle in store init)
        // Here we just respect the class applied by logic below
    }
    
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <div className="min-h-screen transition-colors duration-300">
        {/* Ambient background blob for visual flair */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10">
          {currentView === 'library' && <Library />}
          {currentView === 'reader' && <PDFReader />}
          {currentView === 'settings' && <Settings />}
        </div>

        {/* Floating Dark Mode Toggle (visible in Library/Settings) */}
        {currentView !== 'reader' && (
             <button
                onClick={() => useStore.getState().toggleDarkMode()}
                className="fixed bottom-6 right-6 p-3 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:scale-110 transition-transform z-50"
             >
                {settings.darkMode ? '☀️' : '🌙'}
             </button>
        )}
    </div>
  );
};

export default App;
