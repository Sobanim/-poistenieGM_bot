import dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';
import { setupBotHandlers } from './config/botHandlers.js';

// Определяем переменные в зависимости от режима
const isDevelopment = process.env.NODE_ENV === 'development';
const botToken = isDevelopment ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;
export const adminId = isDevelopment ? process.env.DEV_ADMIN_ID : process.env.ADMIN_ID;

const bot = new Telegraf(botToken);

// Добавляем переменные в контекст для использования в обработчиках
bot.use((ctx, next) => {
  ctx.bot = bot;
  ctx.adminId = adminId;
  ctx.isDevelopment = isDevelopment;
  return next();
});

// Настраиваем обработчики через общую функцию
setupBotHandlers(bot);

bot.launch().then(() => {
  console.log('Бот запущен!');
  console.log('Ожидание сообщений...');
  console.log('ID бота:', bot.botInfo?.id || 'Не получен');
  console.log('Username бота:', bot.botInfo?.username || 'Не получен');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});
