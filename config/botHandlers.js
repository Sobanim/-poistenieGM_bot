import { handleStart, handleCallbackQuery } from '../handlers/basicHandlers.js';
import { handleOrderTextMessage, handlePhoneContact } from '../handlers/order/orderTextHandlers.js';

export function setupBotHandlers(bot) {
  // Set up handlers
  bot.start(handleStart);

  // Handle callback_query
  bot.on('callback_query', async (ctx) => {
    try {
      console.log(`[DEBUG] Received callback from user ${ctx.from.id}: "${ctx.callbackQuery.data}"`);

      // Answer the callback_query right away to remove the "loading" state from the button
      await ctx.answerCbQuery();

      // Then handle the logic
      await handleCallbackQuery(ctx);

      console.log(`[DEBUG] Callback handled successfully for user ${ctx.from.id}`);
    } catch (error) {
      console.error(`[ERROR] Error handling callback from user ${ctx.from.id}:`, error);

      // Answer the callback even if an error occurred
      try {
        await ctx.answerCbQuery('Произошла ошибка. Попробуйте еще раз.');
      } catch (answerError) {
        console.error('[ERROR] Error answering the callback:', answerError);
      }
    }
  });

  // Handle text messages for orders
  bot.on('text', async (ctx) => {
    console.log(`[DEBUG] Received text message from user ${ctx.from.id}: "${ctx.message.text}"`);

    try {
      const handled = await handleOrderTextMessage(ctx);
      console.log(`[DEBUG] Message handled within order flow: ${handled}`);

      if (!handled) {
        console.log(`[DEBUG] Sending default reply to user ${ctx.from.id}`);
        await ctx.reply(
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
    } catch (error) {
      console.error(`[ERROR] Error handling text from user ${ctx.from.id}:`, error);
    }
  });

  // Handle contacts
  bot.on('contact', async (ctx) => {
    console.log(`[DEBUG] Received contact from user ${ctx.from.id}`);
    try {
      await ctx.reply('Дякую! Контакт отримано.', {
        reply_markup: { remove_keyboard: true }
      });
      await handlePhoneContact(ctx);
    } catch (error) {
      console.error(`[ERROR] Error handling contact from user ${ctx.from.id}:`, error);
      await ctx.reply('❌ Сталася помилка при обробці вашого контакту. Спробуйте ще раз.');
    }
  });
}
