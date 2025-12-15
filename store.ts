import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BookMetadata, AppSettings, ViewState } from './types';
import { deletePDFBlob } from './services/db';

interface AppState {
  // State
  books: BookMetadata[];
  settings: AppSettings;
  currentView: ViewState;
  activeBookId: string | null;

  // Actions
  addBook: (book: BookMetadata) => void;
  removeBook: (id: string) => Promise<void>;
  updateProgress: (id: string, page: number, total: number) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setView: (view: ViewState) => void;
  openBook: (id: string) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      books: [],
      settings: {
        telegramBotToken: '',
        telegramChatId: '',
        darkMode: false,
      },
      currentView: 'library',
      activeBookId: null,

      addBook: (book) =>
        set((state) => ({ books: [book, ...state.books] })),

      removeBook: async (id) => {
        // Remove from IDB
        try {
          await deletePDFBlob(id);
        } catch (e) {
          console.error("Failed to delete from IDB", e);
        }
        // Remove from State
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          activeBookId: state.activeBookId === id ? null : state.activeBookId,
          currentView: state.activeBookId === id ? 'library' : state.currentView
        }));
      },

      updateProgress: (id, page, total) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === id
              ? {
                  ...b,
                  currentPage: page,
                  totalPages: total,
                  progressPercent: Math.round((page / total) * 100),
                  lastRead: Date.now(),
                }
              : b
          ),
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setView: (view) => set({ currentView: view }),

      openBook: (id) => set({ activeBookId: id, currentView: 'reader' }),

      toggleDarkMode: () =>
        set((state) => ({
          settings: { ...state.settings, darkMode: !state.settings.darkMode },
        })),
    }),
    {
      name: 'zen-reader-storage',
      partialize: (state) => ({ books: state.books, settings: state.settings }), // Don't persist view state
    }
  )
);
