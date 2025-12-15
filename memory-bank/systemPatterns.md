# System Patterns

## Архитектура
- **Frontend**: Single Page Application (SPA).
- **Framework**: React 19.
- **Build Tool**: Vite.
- **State Management**: Zustand (глобальный стейт).
- **Styling**: Vanilla CSS / Modules (TBD, пока не определено явно, но в правилах "Vanilla CSS for maximum flexibility" как дефолт, если не указано иное). *В `package.json` нет tailwind, значит Vanilla/CSS-in-JS.*

## Структура проекта
```
/src
  /components - UI компоненты
  /services   - Взаимодействие с API/Логика
  App.tsx     - Корневой компонент
  store.ts    - Zustand store
```

## Паттерны проектирования
- **Component-Based**: Разделение на переиспользуемые компоненты.
- **Hooks**: Использование кастомных хуков для логики.
- **Store**: Централизованное управление состоянием приложения (Zustand).

## Соглашения
- Именование файлов: PascalCase для компонентов (`MyComponent.tsx`), camelCase для утилит/хуков.
- Типизация: TypeScript Strict Mode.
