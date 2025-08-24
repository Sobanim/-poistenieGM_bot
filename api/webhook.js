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

// Исправленная обработка callback_query
bot.on('callback_query', async (ctx) => {
  try {
    console.log(`[DEBUG] [WEBHOOK] Получен callback от пользователя ${ctx.from.id}: "${ctx.callbackQuery.data}"`);

    // Сразу отвечаем на callback_query, чтобы убрать "загрузку" с кнопки
    await ctx.answerCbQuery();

    // Затем обрабатываем логику
    await handleCallbackQuery(ctx);

    console.log(`[DEBUG] [WEBHOOK] Callback обработан успешно для пользователя ${ctx.from.id}`);
  } catch (error) {
    console.error(`[ERROR] [WEBHOOK] Ошибка обработки callback от пользователя ${ctx.from.id}:`, error);

    // Отвечаем на callback даже в случае ошибки
    try {
      await ctx.answerCbQuery('Произошла ошибка. Попробуйте еще раз.');
    } catch (answerError) {
      console.error('[ERROR] [WEBHOOK] Ошибка при ответе на callback:', answerError);
    }
  }
});

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
    // Устанавливаем таймаут для обработки запроса
    res.setTimeout(8000); // 8 секунд для Vercel

    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Webhook endpoint is working!',
        timestamp: new Date().toISOString(),
        bot_status: 'active'
      });
    }

    if (req.method === 'POST') {
      // Добавляем валидацию входящих данных
      if (!req.body || !req.body.update_id) {
        console.log('[WARNING] Получен некорректный webhook payload');
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }

      console.log(`[DEBUG] [WEBHOOK] Обрабатываем update ${req.body.update_id}`);

      // Обрабатываем обновление от Telegram
      await bot.handleUpdate(req.body);

      console.log(`[DEBUG] [WEBHOOK] Update ${req.body.update_id} обработан успешно`);

      return res.status(200).json({ ok: true, update_id: req.body.update_id });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('[ERROR] [WEBHOOK] Error handling webhook:', error);

    // Возвращаем 200, чтобы Telegram не повторял запрос
    return res.status(200).json({
      ok: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
