import React, { useState } from 'react';
import { useStore } from '../store';
import { BookMetadata } from '../types';
import { savePDFBlob, initDB } from '../services/db';
import { GlassCard } from './ui/GlassCard';
import { Plus, BookOpen, Settings as SettingsIcon, Trash2, Download, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const Library: React.FC = () => {
  const { books, addBook, removeBook, openBook, setView } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ensure DB is ready
  React.useEffect(() => {
    initDB().catch(console.error);
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    setLoading(true);
    setError('');

    try {
      // PROXY LOGIC: Use a public CORS proxy for the demo to work without a real backend
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Не удалось загрузить PDF. Проверьте ссылку.');
      
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') throw new Error('Ссылка не ведет на PDF файл');

      const id = generateId();
      
      // Save heavy blob to IDB
      await savePDFBlob(id, blob);

      // Save metadata to Store
      const newBook: BookMetadata = {
        id,
        title,
        author: author || 'Неизвестный автор',
        totalPages: 0, // Will be updated when opened
        currentPage: 1,
        progressPercent: 0,
        dateAdded: Date.now(),
        lastRead: Date.now(),
      };

      addBook(newBook);
      setShowAddModal(false);
      setUrl('');
      setTitle('');
      setAuthor('');
    } catch (err: any) {
      setError(err.message || 'Ошибка импорта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Библиотека</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Ваша коллекция</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setView('settings')}
                className="p-3 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:scale-105 transition-transform"
                title="Настройки"
            >
                <SettingsIcon size={20} />
            </button>
            <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-5 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:scale-105 transition-transform shadow-lg shadow-zinc-500/20"
            >
                <Plus size={20} className="mr-2" /> Добавить
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <BookOpen size={48} className="mb-4 opacity-50" />
                <p>Книг пока нет. Добавьте первую по ссылке.</p>
            </div>
        )}

        {books.map((book) => (
          <GlassCard key={book.id} className="group relative overflow-hidden aspect-[3/4] flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all" onClick={() => openBook(book.id)}>
             {/* Dynamic gradient cover generation based on title hash for visual variety */}
            <div className={`h-2/3 w-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center p-6 relative`}>
                <BookOpen size={48} className="text-zinc-300 dark:text-zinc-700 absolute" />
                <div className="z-10 text-center">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 line-clamp-3 leading-tight font-serif italic">
                        {book.title}
                    </h3>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-1000" 
                        style={{ width: `${book.progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between bg-white/40 dark:bg-zinc-900/40">
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">{book.title}</h3>
                    <p className="text-sm text-zinc-500 truncate">{book.author}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {book.progressPercent}% прочтено
                    </span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); removeBook(book.id); }}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        title="Удалить"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <GlassCard className="w-full max-w-md p-8 relative z-10 animate-scale-in">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Импорт книги</h2>
            
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ссылка на PDF</label>
                <div className="relative">
                    <input 
                        type="url" 
                        required
                        placeholder="https://example.com/book.pdf" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <Download className="absolute left-3 top-3.5 text-zinc-400" size={18} />
                </div>
                <p className="text-xs text-zinc-400 mt-1">Только прямые ссылки. Используется прокси.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Название</label>
                    <input 
                        type="text" 
                        required
                        placeholder="Преступление и наказание" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Автор</label>
                    <input 
                        type="text" 
                        placeholder="Федор Достоевский" 
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
              </div>

              {error && (
                <div className="flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg dark:bg-red-900/20">
                    <AlertCircle size={16} className="mr-2" />
                    {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    Отмена
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center"
                >
                    {loading ? <SettingsIcon className="animate-spin mr-2" size={18} /> : null}
                    {loading ? 'Загрузка...' : 'Добавить'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};