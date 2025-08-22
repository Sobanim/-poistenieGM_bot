import fetch from 'node-fetch';

async function setWebhookDirect() {
  const botToken = process.argv[2];
  const webhookUrl = 'https://poistenie-gm-bot.vercel.app/api/webhook';

  if (!botToken) {
    console.log('❌ Использование: node set-webhook-direct.js <BOT_TOKEN>');
    console.log('Пример: node set-webhook-direct.js 123456:ABC-DEF...');
    process.exit(1);
  }

  try {
    console.log('🔧 Устанавливаем webhook...');
    console.log('📍 URL:', webhookUrl);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: webhookUrl
      })
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook установлен успешно!');
    } else {
      console.log('❌ Ошибка установки webhook:', result.description);
    }

    // Проверяем информацию о webhook
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();

    if (webhookInfo.ok) {
      console.log('📊 Информация о webhook:', {
        url: webhookInfo.result.url,
        pending_updates: webhookInfo.result.pending_update_count
      });
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

setWebhookDirect();
