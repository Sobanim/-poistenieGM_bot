# Деплой Telegram бота на Vercel

Этот проект адаптирован для работы на Vercel как serverless приложение.

## Структура проекта для Vercel

- `api/webhook.js` - основная функция для обработки webhook'ов от Telegram
- `api/status.js` - функция для проверки статуса бота
- `api/setup-webhook.js` - функция для установки webhook'а
- `vercel.json` - конфигурация Vercel

## Настройка и деплой

### 1. Установите Vercel CLI (если еще не установлен)
```bash
npm i -g vercel
```

### 2. Логинитесь в Vercel
```bash
vercel login
```

### 3. Деплой проекта
```bash
vercel
```

### 4. Настройка переменных окружения в Vercel (опционально)

В настройках проекта на Vercel можете добавить:
- `BOT_TOKEN` - токен вашего Telegram бота

### 5. Установка webhook'а

После деплоя есть несколько способов установить webhook:

**Способ 1: Через API функцию (рекомендуется)**
```bash
curl -X POST "https://your-project.vercel.app/api/setup-webhook" \
     -H "Content-Type: application/json" \
     -d '{"botToken": "YOUR_BOT_TOKEN"}'
```

**Способ 2: Если добавили BOT_TOKEN в переменные Vercel**
```bash
curl -X POST "https://your-project.vercel.app/api/setup-webhook"
```

**Способ 3: Напрямую через Telegram API**
```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://your-project.vercel.app/api/webhook
```

## Проверка работы

- Статус бота: `https://your-project.vercel.app/api/status`
- Webhook endpoint: `https://your-project.vercel.app/api/webhook`
- Справка по установке webhook: `https://your-project.vercel.app/api/setup-webhook`

## Основные преимущества Vercel

1. **Serverless архитектура**: Функции запускаются только при необходимости
2. **Нет проблем с засыпанием**: В отличие от Render, функции не "засыпают"
3. **Автоматическое масштабирование**: Обрабатывает любое количество пользователей
4. **Быстрый деплой**: Автоматический деплой при пуше в Git

## Локальная разработка

Для тестирования локально:
```bash
npm run vercel-dev
```

Это запустит локальный сервер Vercel для разработки.

## Ограничения Vercel

- Максимальное время выполнения функции: 10 секунд (Hobby план)
- Максимальный размер запроса: 4.5MB

Для большинства Telegram ботов этих ограничений достаточно.
