import { Telegraf } from 'telegraf';
import { setupBotHandlers } from '../config/botHandlers.js';

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Добавляем экземпляр бота в контекст для использования в обработчиках
bot.use((ctx, next) => {
  ctx.bot = bot;
  return next();
});

// Настраиваем обработчики через общую функцию
setupBotHandlers(bot);

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
