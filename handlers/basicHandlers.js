import { insuranceDetails } from './insuranceDetails.js';

export function handleStart(ctx) {
  ctx.reply(
    'Вітаємо! Страхування є обов’язковим для поселення у Словаччині. Оберіть дію:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Дізнатись варіанти страхування', callback_data: 'insurance_options' }
            // { text: 'Залишити запит на консультацію', callback_data: 'consult_request' }
          ],
          [
            { text: 'Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    }
  );
}

export function handleCallbackQuery(ctx) {
  const data = ctx.callbackQuery.data;
  switch (data) {
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
            { text: 'Назад', callback_data: 'back' },
            { text: 'Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;
  case 'consult_request':
    ctx.reply('Будь ласка, надішліть свій номер телефону або email для зв’язку з консультантом.', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Назад', callback_data: 'back' },
            { text: 'Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;
  case 'insurance_ukraine':
    ctx.reply(insuranceDetails.ukraine, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Назад', callback_data: 'back' },
            { text: 'Головне меню', callback_data: 'main_menu' }
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
            { text: 'Назад', callback_data: 'back' },
            { text: 'Головне меню', callback_data: 'main_menu' }
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
            { text: 'Назад', callback_data: 'back' },
            { text: 'Головне меню', callback_data: 'main_menu' }
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
            { text: 'Назад', callback_data: 'back' },
            { text: 'Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;
  case 'main_menu':
    handleStart(ctx);
    break;
  case 'back':
    // Если пользователь был в подробной информации — возвращаем к списку вариантов
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
            { text: 'Назад', callback_data: 'back' },
            { text: 'Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
    break;
  default:
    ctx.reply('Невідома дія.', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    });
  }
  try {
    ctx.answerCbQuery();
  } catch (err) {
    console.error('Ошибка answerCbQuery:', err.message);
  }
}
