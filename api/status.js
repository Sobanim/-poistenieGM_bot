import { Telegraf } from 'telegraf';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const bot = new Telegraf(process.env.BOT_TOKEN);

    const webhookInfo = await bot.telegram.getWebhookInfo();
    const botInfo = await bot.telegram.getMe();

    return res.status(200).json({
      status: 'OK',
      platform: 'Vercel',
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name
      },
      webhook: {
        url: webhookInfo.url,
        has_custom_certificate: webhookInfo.has_custom_certificate,
        pending_update_count: webhookInfo.pending_update_count,
        last_error_date: webhookInfo.last_error_date,
        last_error_message: webhookInfo.last_error_message
      },
      server_time: new Date().toISOString(),
      vercel_region: process.env.VERCEL_REGION || 'unknown'
    });

  } catch (error) {
    console.error('Error getting status:', error);
    return res.status(500).json({
      status: 'ERROR',
      error: error.message,
      server_time: new Date().toISOString()
    });
  }
}
