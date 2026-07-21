import { Telegraf } from 'telegraf';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Setup Webhook API',
        usage: {
          method: 'POST',
          body: '{"botToken": "your_bot_token"}',
          note: 'Or use the BOT_TOKEN environment variable in Vercel'
        }
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Try to get the token from the request body or environment variables
    const { botToken } = req.body;
    const token = botToken || process.env.BOT_TOKEN;

    if (!token) {
      return res.status(400).json({
        error: 'BOT_TOKEN is required',
        options: [
          'Pass it in JSON: {"botToken": "your_bot_token"}',
          'Or set the BOT_TOKEN environment variable in Vercel settings'
        ]
      });
    }

    const bot = new Telegraf(token);
    const webhookUrl = `https://${req.headers.host}/api/webhook`;

    console.log('🔧 Setting webhook to:', webhookUrl);

    await bot.telegram.setWebhook(webhookUrl);

    // Verify the setup
    const webhookInfo = await bot.telegram.getWebhookInfo();
    const botInfo = await bot.telegram.getMe();

    return res.status(200).json({
      success: true,
      message: 'Webhook set successfully!',
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
    console.error('❌ Error setting webhook:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
