import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

async function checkWebhook() {
  try {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    console.log('🔍 Проверяем текущее состояние webhook...');

    const webhookInfo = await bot.telegram.getWebhookInfo();

    console.log('📊 Информация о webhook:', {
      url: webhookInfo.url || '❌ НЕ УСТАНОВЛЕН',
      has_custom_certificate: webhookInfo.has_custom_certificate,
      pending_update_count: webhookInfo.pending_update_count,
      last_error_date: webhookInfo.last_error_date,
      last_error_message: webhookInfo.last_error_message || 'Нет ошибок',
      max_connections: webhookInfo.max_connections,
      allowed_updates: webhookInfo.allowed_updates
    });

    const botInfo = await bot.telegram.getMe();
    console.log('🤖 Информация о боте:', {
      id: botInfo.id,
      username: `@${botInfo.username}`,
      first_name: botInfo.first_name
    });

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.message.includes('401')) {
      console.log('💡 Проверьте правильность BOT_TOKEN в .env файле');
    }
  }
}

checkWebhook();
