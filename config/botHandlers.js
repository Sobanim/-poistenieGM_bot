import { handleStart, handleCallbackQuery } from '../handlers/basicHandlers.js';
import { handleOrderTextMessage, handlePhoneContact } from '../handlers/order/orderTextHandlers.js';

export function setupBotHandlers(bot) {
  // Настраиваем обработчики
  bot.start(handleStart);

  // Обработка callback_query
  bot.on('callback_query', async (ctx) => {
    try {
      console.log(`[DEBUG] Получен callback от пользователя ${ctx.from.id}: "${ctx.callbackQuery.data}"`);

      // Сразу отвечаем на callback_query, чтобы убрать "загрузку" с кнопки
      await ctx.answerCbQuery();

      // Затем обрабатываем логику
      await handleCallbackQuery(ctx);

      console.log(`[DEBUG] Callback обработан успешно для пользователя ${ctx.from.id}`);
    } catch (error) {
      console.error(`[ERROR] Ошибка обработки callback от пользователя ${ctx.from.id}:`, error);

      // Отвечаем на callback даже в случае ошибки
      try {
        await ctx.answerCbQuery('Произошла ошибка. Попробуйте еще раз.');
      } catch (answerError) {
        console.error('[ERROR] Ошибка при ответе на callback:', answerError);
      }
    }
  });

  // Обработка текстовых сообщений для заказов
  bot.on('text', async (ctx) => {
    console.log(`[DEBUG] Получено текстовое сообщение от пользователя ${ctx.from.id}: "${ctx.message.text}"`);

    try {
      const handled = await handleOrderTextMessage(ctx);
      console.log(`[DEBUG] Сообщение обработано в процессе заказа: ${handled}`);

      if (!handled) {
        console.log(`[DEBUG] Отправляем стандартный ответ пользователю ${ctx.from.id}`);
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
      console.error(`[ERROR] Ошибка обработки текста от пользователя ${ctx.from.id}:`, error);
    }
  });

  // Обработка контактов
  bot.on('contact', async (ctx) => {
    console.log(`[DEBUG] Получен контакт от пользователя ${ctx.from.id}`);
    try {
      await ctx.reply('Дякую! Контакт отримано.', {
        reply_markup: { remove_keyboard: true }
      });
      await handlePhoneContact(ctx);
    } catch (error) {
      console.error(`[ERROR] Ошибка обработки контакта от пользователя ${ctx.from.id}:`, error);
      await ctx.reply('❌ Сталася помилка при обробці вашого контакту. Спробуйте ще раз.');
    }
  });
}
