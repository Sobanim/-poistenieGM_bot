import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { handleStart, handleCallbackQuery } from './handlers/basicHandlers.js';
import { handleOrderTextMessage, handlePhoneContact } from './handlers/order/orderTextHandlers.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Добавляем экземпляр бота в контекст для использования в обработчиках
bot.use((ctx, next) => {
  ctx.bot = bot;
  return next();
});

bot.start(handleStart);
bot.on('callback_query', handleCallbackQuery);

// КРИТИЧЕСКИ ВАЖНО: Добавляем обработку текстовых сообщений для заказов
bot.on('text', (ctx) => {
  console.log(`[DEBUG] [WEBHOOK] Получено текстовое сообщение от пользователя ${ctx.from.id}: "${ctx.message.text}"`);

  // Проверяем, находится ли пользователь в процессе заказа
  const handled = handleOrderTextMessage(ctx);

  console.log(`[DEBUG] [WEBHOOK] Сообщение обработано в процессе заказа: ${handled}`);

  if (!handled) {
    console.log(`[DEBUG] [WEBHOOK] Отправляем стандартный ответ пользователю ${ctx.from.id}`);
    // Если сообщение не обработано в процессе заказа, показываем главное меню
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

// Обработка контактов (когда пользователь делится номером телефона)
bot.on('contact', (ctx) => {
  console.log(`[DEBUG] [WEBHOOK] Получен контакт от пользователя ${ctx.from.id}`);
  const handled = handlePhoneContact(ctx);

  if (handled) {
    // Скрываем клавиатуру после получения контакта
    ctx.reply('Дякую! Контакт отримано.', {
      reply_markup: { remove_keyboard: true }
    });
  }
});

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  try {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling update:', error);
    res.sendStatus(500);
  }
});

app.get('/webhook', (req, res) => {
  res.send('Webhook endpoint is working!');
});

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Добавляем endpoint для диагностики
app.get('/status', async (req, res) => {
  try {
    const webhookInfo = await bot.telegram.getWebhookInfo();
    const botInfo = await bot.telegram.getMe();

    res.json({
      status: 'OK',
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
      server_time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      server_time: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 3000;

// Установка webhook при запуске
async function setupWebhook() {
  try {
    const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
    console.log('Setting webhook to:', webhookUrl);

    await bot.telegram.setWebhook(webhookUrl);
    console.log('Webhook установлен успешно');

    // Получаем информацию о боте
    const botInfo = await bot.telegram.getMe();
    console.log('Bot info:', botInfo);

  } catch (error) {
    console.error('Ошибка установки webhook:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await setupWebhook();
});
