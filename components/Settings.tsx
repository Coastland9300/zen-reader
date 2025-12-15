import React, { useState } from 'react';
import { useStore } from '../store';
import { GlassCard } from './ui/GlassCard';
import { Save, Check, ArrowLeft } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, setView } = useStore();
  const [token, setToken] = useState(settings.telegramBotToken);
  const [chatId, setChatId] = useState(settings.telegramChatId);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ telegramBotToken: token, telegramChatId: chatId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 pt-24 animate-fade-in">
       <button 
        onClick={() => setView('library')}
        className="flex items-center text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Назад в библиотеку
      </button>

      <GlassCard className="p-8">
        <h2 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Настройки</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Настройте интеграцию с Telegram для синхронизации прогресса чтения между устройствами через сообщения бота.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Токен бота (Bot Token)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456789:ABCdef..."
              className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-900 dark:text-white"
            />
            <p className="text-xs text-zinc-400 mt-2">Можно получить в @BotFather</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              ID чата (Chat ID)
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="12345678"
              className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-900 dark:text-white"
            />
            <p className="text-xs text-zinc-400 mt-2">Ваш User ID или Channel ID</p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className={`
                flex items-center px-6 py-3 rounded-xl font-medium text-white transition-all
                ${saved ? 'bg-green-500' : 'bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:opacity-90'}
              `}
            >
              {saved ? <Check size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
              {saved ? 'Сохранено' : 'Сохранить'}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};