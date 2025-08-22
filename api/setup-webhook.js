import { Telegraf } from 'telegraf';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Setup Webhook API',
        usage: {
          method: 'POST',
          body: '{"botToken": "your_bot_token"}',
          note: 'Или используйте переменную окружения BOT_TOKEN в Vercel'
        }
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Пытаемся получить токен из тела запроса или переменных окружения
    const { botToken } = req.body;
    const token = botToken || process.env.BOT_TOKEN;

    if (!token) {
      return res.status(400).json({
        error: 'BOT_TOKEN is required',
        options: [
          'Передайте в JSON: {"botToken": "your_bot_token"}',
          'Или установите переменную BOT_TOKEN в настройках Vercel'
        ]
      });
    }

    const bot = new Telegraf(token);
    const webhookUrl = `https://${req.headers.host}/api/webhook`;

    console.log('🔧 Устанавливаем webhook на:', webhookUrl);

    await bot.telegram.setWebhook(webhookUrl);

    // Проверяем установку
    const webhookInfo = await bot.telegram.getWebhookInfo();
    const botInfo = await bot.telegram.getMe();

    return res.status(200).json({
      success: true,
      message: 'Webhook установлен успешно!',
      bot: {
        id: botInfo.id,
        username: `@${botInfo.username}`,
        first_name: botInfo.first_name
      },
      webhook: {
        url: webhookInfo.url,
        pending_updates: webhookInfo.pending_update_count
      }
    });

  } catch (error) {
    console.error('❌ Ошибка установки webhook:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
