import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

async function setupWebhook() {
  try {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    // Получаем URL проекта Vercel из переменной окружения
    const webhookUrl = `${process.env.WEBHOOK_URL}/api/webhook`;

    if (!process.env.WEBHOOK_URL) {
      console.error('❌ Ошибка: Не указана переменная окружения WEBHOOK_URL');
      console.log('Пример: WEBHOOK_URL=https://your-project.vercel.app');
      process.exit(1);
    }

    console.log('🔧 Устанавливаем webhook на:', webhookUrl);

    await bot.telegram.setWebhook(webhookUrl);
    console.log('✅ Webhook установлен успешно!');

    // Получаем информацию о боте для проверки
    const botInfo = await bot.telegram.getMe();
    console.log('🤖 Информация о боте:', {
      id: botInfo.id,
      username: botInfo.username,
      first_name: botInfo.first_name
    });

    // Проверяем webhook
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log('🌐 Информация о webhook:', {
      url: webhookInfo.url,
      pending_updates: webhookInfo.pending_update_count
    });

  } catch (error) {
    console.error('❌ Ошибка при установке webhook:', error);
    process.exit(1);
  }
}

setupWebhook();
