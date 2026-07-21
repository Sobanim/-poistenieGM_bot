import { Telegraf } from 'telegraf';
import { setupBotHandlers } from '../config/botHandlers.js';
import { botToken, adminId, isDevelopment } from '../config/env.js';

// Create the bot instance
const bot = new Telegraf(botToken);

// Add the bot instance to the context for use in handlers
bot.use((ctx, next) => {
  ctx.bot = bot;
  ctx.adminId = adminId;
  ctx.isDevelopment = isDevelopment;
  return next();
});

// Set up handlers via the shared function
setupBotHandlers(bot);

export default async function handler(req, res) {
  try {
    // Set a timeout for handling the request
    res.setTimeout(8000); // 8 seconds for Vercel

    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Webhook endpoint is working!',
        timestamp: new Date().toISOString(),
        bot_status: 'active'
      });
    }

    if (req.method === 'POST') {
      // Validate the incoming payload
      if (!req.body || !req.body.update_id) {
        console.log('[WARNING] Received an invalid webhook payload');
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }

      console.log(`[DEBUG] [WEBHOOK] Processing update ${req.body.update_id}`);

      // Process the update from Telegram
      await bot.handleUpdate(req.body);

      console.log(`[DEBUG] [WEBHOOK] Update ${req.body.update_id} processed successfully`);

      return res.status(200).json({ ok: true, update_id: req.body.update_id });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('[ERROR] [WEBHOOK] Error handling webhook:', error);

    // Return 200 so Telegram doesn't retry the request
    return res.status(200).json({
      ok: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
