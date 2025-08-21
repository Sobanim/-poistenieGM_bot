import dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';
import { handleStart, handleCallbackQuery } from './handlers/basicHandlers.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(handleStart);
bot.on('callback_query', handleCallbackQuery);

bot.launch().then(() => {
  console.log('Бот запущен!');
  console.log('Ожидание сообщений...');
  console.log('ID бота:', bot.botInfo?.id || 'Не получен');
  console.log('Username бота:', bot.botInfo?.username || 'Не получен');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});
