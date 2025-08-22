import { Telegraf } from 'telegraf';
import { handleStart, handleCallbackQuery } from '../handlers/basicHandlers.js';
import { handleOrderTextMessage, handlePhoneContact } from '../handlers/order/orderTextHandlers.js';

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Добавляем экземпляр бота в контекст для использования в обработчиках
bot.use((ctx, next) => {
  ctx.bot = bot;
  return next();
});

// Настраиваем обработчики
bot.start(handleStart);
bot.on('callback_query', handleCallbackQuery);

// Обработка текстовых сообщений для заказов
bot.on('text', (ctx) => {
  console.log(`[DEBUG] [WEBHOOK] Получено текстовое сообщение от пользователя ${ctx.from.id}: "${ctx.message.text}"`);

  const handled = handleOrderTextMessage(ctx);
  console.log(`[DEBUG] [WEBHOOK] Сообщение обработано в процессе заказа: ${handled}`);

  if (!handled) {
    console.log(`[DEBUG] [WEBHOOK] Отправляем стандартный ответ пользователю ${ctx.from.id}`);
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

// Обработка контактов
bot.on('contact', (ctx) => {
  console.log(`[DEBUG] [WEBHOOK] Получен контакт от пользователя ${ctx.from.id}`);
  const handled = handlePhoneContact(ctx);

  if (handled) {
    ctx.reply('Дякую! Контакт отримано.', {
      reply_markup: { remove_keyboard: true }
    });
  }
});

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Webhook endpoint is working!',
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      // Обрабатываем обновление от Telegram
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
