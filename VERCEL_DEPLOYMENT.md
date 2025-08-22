# Деплой Telegram бота на Vercel

Этот проект адаптирован для работы на Vercel как serverless приложение.

## Структура проекта для Vercel

- `api/webhook.js` - основная функция для обработки webhook'ов от Telegram
- `api/status.js` - функция для проверки статуса бота
- `vercel.json` - конфигурация Vercel
- `setup-webhook.js` - скрипт для установки webhook'а

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

### 4. Настройка переменных окружения в Vercel

В настройках проекта на Vercel добавьте переменные:

- `BOT_TOKEN` - токен вашего Telegram бота
- `WEBHOOK_URL` - URL вашего проекта на Vercel (например: https://your-project.vercel.app)

### 5. Установка webhook'а

После деплоя выполните:
```bash
npm run setup-webhook
```

Или установите webhook вручную через API:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-project.vercel.app/api/webhook"}'
```

## Проверка работы

- Статус бота: `https://your-project.vercel.app/api/status`
- Webhook endpoint: `https://your-project.vercel.app/api/webhook`

## Основные отличия от Render

1. **Serverless архитектура**: Каждый запрос обрабатывается отдельной функцией
2. **Нет постоянного состояния**: Состояние между запросами не сохраняется
3. **Автоматическое масштабирование**: Функции запускаются только при необходимости
4. **Нет проблем с засыпанием**: В отличие от Render, функции не "засыпают"

## Локальная разработка

Для тестирования локально:
```bash
npm run vercel-dev
```

Это запустит локальный сервер Vercel для разработки.

## Ограничения Vercel

- Максимальное время выполнения функции: 10 секунд (Hobby план)
- Максимальный размер запроса: 4.5MB
- Максимальный размер ответа: 4.5MB

Для большинства Telegram ботов этих ограничений достаточно.
