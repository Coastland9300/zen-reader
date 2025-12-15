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
    <div className="library-container animate-fade-in" style={{ maxWidth: '42rem', margin: '0 auto', paddingTop: '6rem' }}>
      <button
        onClick={() => setView('library')}
        className="btn-text flex items-center mb-4"
        style={{ paddingLeft: 0 }}
      >
        <ArrowLeft size={16} className="mr-2" /> Назад в библиотеку
      </button>

      <GlassCard className="p-4" style={{ padding: '2rem' }}>
        <h2 className="text-2xl font-semibold mb-2">Настройки</h2>
        <p className="text-muted mb-4">
          Настройте интеграцию с Telegram для синхронизации прогресса чтения между устройствами через сообщения бота.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Токен бота (Bot Token)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456789:ABCdef..."
              className="input-field"
            />
            <p className="text-xs text-muted mt-2">Можно получить в @BotFather</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              ID чата (Chat ID)
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="12345678"
              className="input-field"
            />
            <p className="text-xs text-muted mt-2">Ваш User ID или Channel ID</p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className={`btn ${saved ? 'btn-primary' : 'btn-primary'}`}
              style={{ backgroundColor: saved ? '#22c55e' : 'var(--accent-color)' }}
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