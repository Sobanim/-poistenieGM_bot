import { insuranceDetails } from './insuranceDetails.js';
import {
  handleOrderStart,
  handleInsuranceSelection,
  clearUserState
} from './order/orderHandlers.js';
import {
  handleEditCallbacks,
  handleOrderConfirmation,
  handleOrderCancellation
} from './order/orderTextHandlers.js';

export function handleStart(ctx) {
  const userId = ctx.from.id;
  // Очищаем состояние пользователя при старте
  clearUserState(userId);

  ctx.reply(
    'Вітаємо! Страхування є обов\'язковим для поселення у Словаччині. Оберіть дію:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'ℹ️ Дізнатись варіанти страхування', callback_data: 'insurance_options' }
          ],
          [
            { text: '📋 Замовити страховку', callback_data: 'order_insurance' }
          ],
          [
            { text: '🏠 Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    }
  );
}

export function handleCallbackQuery(ctx) {
  const data = ctx.callbackQuery.data;

  // Обрабатываем callback'и
  ctx.answerCbQuery();

  switch (data) {
  case 'main_menu':
    handleStart(ctx);
    break;

  case 'insurance_options':
    ctx.reply('Оберіть тип страхування:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🇺🇦 Українське туристичне', callback_data: 'insurance_ukraine' },
            { text: '🇸🇰 Словацьке екстрене (AXA)', callback_data: 'insurance_axa' }
          ],
          [
            { text: '🇸🇰 Словацьке медичне (Union)', callback_data: 'insurance_union' },
            { text: '🌍 Міжнародне ризикове життя', callback_data: 'insurance_life' }
          ],
          [
            { text: '← Назад', callback_data: 'back' },
            { text: '🏠 Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;

  case 'order_insurance':
    handleOrderStart(ctx);
    break;

  // Обработка заказов страховки
  case 'order_ukraine':
  case 'order_axa':
  case 'order_union':
  case 'order_life': {
    const insuranceType = data.replace('order_', '');
    handleInsuranceSelection(ctx, insuranceType);
    break;
  }

  // Обработка редактирования данных заказа
  case 'edit_fullname':
  case 'edit_age':
  case 'edit_contact':
  case 'edit_order_data':
  case 'back_to_confirmation':
    handleEditCallbacks(ctx, data);
    break;

  case 'confirm_order':
    handleOrderConfirmation(ctx);
    break;

  case 'cancel_order':
    handleOrderCancellation(ctx);
    break;

  case 'share_phone':
    ctx.reply(
      'Поділіться своїм номером телефону, натиснувши кнопку нижче:',
      {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Поділитися контактом', request_contact: true }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    );
    break;

  // Информация о страховках
  case 'insurance_ukraine':
    ctx.reply(insuranceDetails.ukraine, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Замовити цю страховку', callback_data: 'order_ukraine' }
          ],
          [
            { text: '← Назад до варіантів', callback_data: 'insurance_options' },
            { text: '🏠 Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;

  case 'insurance_axa':
    ctx.reply(insuranceDetails.axa, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Замовити цю страховку', callback_data: 'order_axa' }
          ],
          [
            { text: '← Назад до варіантів', callback_data: 'insurance_options' },
            { text: '🏠 Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;

  case 'insurance_union':
    ctx.reply(insuranceDetails.union, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Замовити цю страховку', callback_data: 'order_union' }
          ],
          [
            { text: '← Назад до варіантів', callback_data: 'insurance_options' },
            { text: '🏠 Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;

  case 'insurance_life':
    ctx.reply(insuranceDetails.life, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Замовити цю страховку', callback_data: 'order_life' }
          ],
          [
            { text: '← Назад до варіантів', callback_data: 'insurance_options' },
            { text: '🏠 Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;

  case 'back':
    handleStart(ctx);
    break;

  default:
    ctx.reply('Невідома команда. Повертаємося до головного меню.');
    handleStart(ctx);
    break;
  }
}
