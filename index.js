import dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';
import { handleStart, handleCallbackQuery } from './handlers/basicHandlers.js';
import { handleOrderTextMessage, handlePhoneContact } from './handlers/order/orderTextHandlers.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(handleStart);
bot.on('callback_query', handleCallbackQuery);

// Обработка текстовых сообщений (для процесса заказа)
bot.on('text', (ctx) => {
  // Проверяем, находится ли пользователь в процессе заказа
  const handled = handleOrderTextMessage(ctx);

  if (!handled) {
    // Если сообщение не обработано в процессе заказа, показываем главное меню
    ctx.reply(
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
bot.on('contact', (ctx) => {
  const handled = handlePhoneContact(ctx);

  if (handled) {
    // Скрываем клавиатуру после получения контакта
    ctx.reply('Дякую! Контакт отримано.', {
      reply_markup: { remove_keyboard: true }
    });
  }
});

bot.launch().then(() => {
  console.log('Бот запущен!');
  console.log('Ожидание сообщений...');
  console.log('ID бота:', bot.botInfo?.id || 'Не получен');
  console.log('Username бота:', bot.botInfo?.username || 'Не получен');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});
