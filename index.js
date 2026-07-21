import dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';
import { handleStart, handleCallbackQuery } from './handlers/basicHandlers.js';
import { handleOrderTextMessage, handlePhoneContact } from './handlers/order/orderTextHandlers.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Добавляем экземпляр бота в контекст для использования в обработчиках
bot.use((ctx, next) => {
  ctx.bot = bot;
  return next();
});

// Глобальный обработчик ошибок
bot.catch((err, ctx) => {
  console.error(`[ERROR] Необроблена помилка для update ${ctx?.update?.update_id}:`, err);
});

bot.start(handleStart);
bot.on('callback_query', handleCallbackQuery);

// Обработка текстовых сообщений (для процесса заказа)
bot.on('text', async (ctx) => {
  console.log(`[DEBUG] Получено текстовое сообщение от пользователя ${ctx.from.id}`);

  // Проверяем, находится ли пользователь в процессе заказа
  const handled = await handleOrderTextMessage(ctx);

  console.log(`[DEBUG] Сообщение обработано в процессе заказа: ${handled}`);

  if (!handled) {
    // Если сообщение не обработано в процессе заказа, показываем главное меню
    await ctx.reply(
      'Використовуйте кнопки меню для навігації або введіть /start для початку.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Головне меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
  }
});

// Обработка контактов (когда пользователь делится номером телефона)
bot.on('contact', async (ctx) => {
  await handlePhoneContact(ctx);
});

bot.launch().then(() => {
  console.log('Бот запущен!');
  console.log('Ожидание сообщений...');
  console.log('ID бота:', bot.botInfo?.id || 'Не получен');
  console.log('Username бота:', bot.botInfo?.username || 'Не получен');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});

// Корректная остановка при завершении процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
