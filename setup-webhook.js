import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

async function setupWebhook() {
  try {
    // Use the token directly for convenience
    const botToken = process.env.BOT_TOKEN;
    const bot = new Telegraf(botToken);

    // Automatically determine the project URL
    const webhookUrl = process.env.WEBHOOK_URL;

    console.log('🔧 Setting webhook to:', webhookUrl);

    await bot.telegram.setWebhook(webhookUrl);
    console.log('✅ Webhook set successfully!');

    // Get bot info to verify
    const botInfo = await bot.telegram.getMe();
    console.log('🤖 Bot info:', {
      id: botInfo.id,
      username: `@${botInfo.username}`,
      first_name: botInfo.first_name
    });

    // Verify the webhook
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log('🌐 Webhook info:', {
      url: webhookInfo.url,
      pending_updates: webhookInfo.pending_update_count
    });

  } catch (error) {
    console.error('❌ Error setting webhook:', error);
    process.exit(1);
  }
}

setupWebhook();
