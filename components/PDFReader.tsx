import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useStore } from '../store';
import { getPDFBlob } from '../services/db';
import { ArrowLeft, ChevronLeft, ChevronRight, Send, Loader2, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

// Configure PDF.js worker
// pdfjs-dist v4+ requires .mjs extension for the worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFReader: React.FC = () => {
  const { activeBookId, books, updateProgress, setView, settings } = useStore();
  const book = books.find((b) => b.id === activeBookId);
  
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // To handle container resizing for responsiveness
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  useEffect(() => {
    if (!activeBookId) return;

    const loadPdf = async () => {
      try {
        const blob = await getPDFBlob(activeBookId);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPdfData(url);
        } else {
          setLoadError('PDF файл не найден в локальной базе данных.');
          console.error('PDF not found in DB');
        }
      } catch (e) {
        console.error('Error loading PDF', e);
        setLoadError('Не удалось загрузить PDF из хранилища.');
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    // Resize observer for responsive page width
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [activeBookId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading document:', error);
    setLoadError(error.message || 'Не удалось открыть PDF документ.');
  }

  const changePage = (offset: number) => {
    if (!book) return;
    const newPage = Math.min(Math.max(1, book.currentPage + offset), numPages);
    updateProgress(book.id, newPage, numPages);
    
    // Scroll to top of viewer
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const syncToTelegram = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId || !book) {
      alert("Пожалуйста, сначала настройте параметры Telegram в меню настроек.");
      return;
    }

    setIsSyncing(true);
    const message = `📖 Я читаю: "${book.title}"\n📍 Страница ${book.currentPage} из ${numPages} (${book.progressPercent}%)`;
    
    try {
      const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: message,
        }),
      });
      alert("Прогресс синхронизирован!");
    } catch (e) {
      console.error(e);
      alert("Ошибка синхронизации.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!book) return <div>Книга не найдена</div>;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <button 
          onClick={() => setView('library')}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="Назад в библиотеку"
        >
          <ArrowLeft className="text-zinc-700 dark:text-zinc-200" size={20} />
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-white max-w-[200px] truncate">
            {book.title}
          </h1>
          <span className="text-xs text-zinc-500">
            {book.currentPage} из {numPages}
          </span>
        </div>

        <div className="flex gap-2">
            <button
                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                title="Уменьшить"
            >
                <ZoomOut size={18} />
            </button>
            <button
                onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                title="Увеличить"
            >
                <ZoomIn size={18} />
            </button>
            <button
                onClick={syncToTelegram}
                disabled={isSyncing}
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                title="Отправить прогресс в Telegram"
            >
                {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4 flex justify-center w-full min-h-[500px]" ref={containerRef}>
        {loading ? (
          <div className="flex flex-col items-center mt-20">
            <Loader2 className="animate-spin text-zinc-400 mb-2" size={32} />
            <p className="text-zinc-500">Загрузка PDF...</p>
          </div>
        ) : loadError ? (
           <GlassCard className="p-8 flex flex-col items-center justify-center h-fit mt-10">
             <AlertCircle size={48} className="text-red-500 mb-4" />
             <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Не удалось открыть книгу</h3>
             <p className="text-zinc-500 dark:text-zinc-400 text-center mt-2 max-w-xs">{loadError}</p>
             <p className="text-xs text-zinc-400 mt-4 font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                Worker: {pdfjs.GlobalWorkerOptions.workerSrc}
             </p>
           </GlassCard>
        ) : (
          <GlassCard className="p-0 overflow-hidden inline-block shadow-2xl bg-white">
            {pdfData && (
              <Document
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="h-[600px] w-[400px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-zinc-400" />
                  </div>
                }
                error={
                    <div className="flex flex-col items-center justify-center p-10 text-zinc-500">
                        <AlertCircle size={40} className="mb-4" />
                        <p>Ошибка отображения</p>
                    </div>
                }
                className="flex justify-center"
              >
                <Page 
                    pageNumber={book.currentPage} 
                    width={Math.min(containerWidth - 40, 800) * scale}
                    renderTextLayer={false} 
                    renderAnnotationLayer={false}
                    className="shadow-inner"
                />
              </Document>
            )}
          </GlassCard>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <GlassCard className="flex items-center gap-6 px-6 py-3 rounded-full">
          <button 
            onClick={() => changePage(-1)}
            disabled={book.currentPage <= 1}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 disabled:opacity-30 transition-colors text-zinc-800 dark:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300 w-16 text-center">
             {Math.round((book.currentPage / numPages) * 100) || 0}%
          </div>

          <button 
            onClick={() => changePage(1)}
            disabled={book.currentPage >= numPages}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 disabled:opacity-30 transition-colors text-zinc-800 dark:text-white"
          >
            <ChevronRight size={24} />
          </button>
        </GlassCard>
      </div>
    </div>
  );
};