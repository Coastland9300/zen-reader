import React, { useEffect } from 'react';
import { useStore } from './store';
import { Library } from './components/Library';
import { PDFReader } from './components/PDFReader';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const { currentView, settings } = useStore();

  // Handle Dark Mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <div className="app-container">
        {/* Ambient background blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        <div className="content-wrapper">
          {currentView === 'library' && <Library />}
          {currentView === 'reader' && <PDFReader />}
          {currentView === 'settings' && <Settings />}
        </div>

        {/* Floating Dark Mode Toggle (visible in Library/Settings) */}
        {currentView !== 'reader' && (
             <button
                onClick={() => useStore.getState().toggleDarkMode()}
                className="theme-toggle-btn"
                title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
             >
                {settings.darkMode ? '☀️' : '🌙'}
             </button>
        )}
    </div>
  );
};

export default App;
