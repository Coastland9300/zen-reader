export interface BookMetadata {
  id: string;
  title: string;
  author: string;
  coverUrl?: string; // Generated thumbnail or placeholder
  totalPages: number;
  currentPage: number; // 1-based index
  progressPercent: number;
  dateAdded: number;
  lastRead: number;
}

export interface AppSettings {
  telegramBotToken: string;
  telegramChatId: string;
  darkMode: boolean;
}

export type ViewState = 'library' | 'reader' | 'settings';

export interface TelegramResponse {
  ok: boolean;
  description?: string;
}
