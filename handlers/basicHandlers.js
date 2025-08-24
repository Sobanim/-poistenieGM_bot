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
            { text: '❓ Часті питання', callback_data: 'faq' },
            { text: '🏠 Головне меню', callback_data: 'main_menu' }
          ]
        ]
      }
    }
  );
}

export function handleCallbackQuery(ctx) {
  const data = ctx.callbackQuery.data;

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
            { text: '🌍 Міжнародне страхування життя', callback_data: 'insurance_life' }
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

  case 'help_choose':
    ctx.reply(
      `🤔 **Коротко: як вибрати**

💰 **Мінімальний бюджет / "аби було"** → 🇺🇦 Українське туристичне (але май на увазі обмеження та відшкодування "після").

🚑 **Захист від дорогих ургентних кейсів** → 🇸🇰 Словацьке екстрене (~30 €/міс).

🏥 **Комфорт "як у локальних" з доступом до лікарів** → 🇸🇰 Словацьке медичне (~50 €/міс, оплата за 6–12 міс наперед).

💳 **18+ і хочеш оплату помісячно 25–35 € з великими виплатами на руки** → 🌍 Ризикове страхування життя (MetLife/Generali/Allianz/NN).`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📋 Замовити страховку', callback_data: 'order_insurance' }
            ],
            [
              { text: 'ℹ️ Детальніше про варіанти', callback_data: 'insurance_options' }
            ],
            [
              { text: '← Назад', callback_data: 'back' },
              { text: '🏠 Головне меню', callback_data: 'main_menu' }
            ]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
    break;

  case 'faq':
    ctx.reply(
      `❓ **Часті питання**

🧾 **Питання: Чи потрібні чеки для виплат?**
**Відповідь:**
💊 Медичні (екстрене/повне): оплачується послуга за правилами страхової — іноді напряму, іноді з частковою компенсацією.
💰 Ризикове життя: чеки не потрібні; потрібне медичне підтвердження події, виплата — фіксованою сумою на ваш рахунок.

🌍 **Питання: Чи діє поліс за межами Словаччини?**
**Відповідь:**
🇺🇦 Українське туристичне: зазвичай діє у визначених країнах/зонах подорожі.
🇸🇰 Словацькі медичні: в основному для Словаччини.
🌏 Ризикове життя: зазвичай в усьому світі (уточнюється в договорі).

🏠 **Питання: Чи приймає це гуртожиток TUKE?**
**Відповідь:** ✅ Так. За твоїми правилами, усі 4 варіанти підходять як підтвердження наявності страхування для поселення.

👶 **Питання: Я неповнолітній(я) — що можу обрати?**
**Відповідь:** 🇺🇦 Доступні українське туристичне або 🇸🇰 словацькі медичні. 🌍 Ризикове страхування життя — з 18 років.

💳 **Питання: Чи можна оплатити помісячно?**
**Відповідь:**
🇺🇦 Українське туристичне: як правило, одразу за рік.
🇸🇰 Словацькі медичні: зазвичай мінімум 6 міс наперед.
🌍 Ризикове життя: так, помісячно (або квартал/півріччя/рік).`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '← Назад', callback_data: 'back' },
              { text: '🏠 Головне меню', callback_data: 'main_menu' }
            ]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
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
            // { text: '📋 Замовити цю страховку', callback_data: 'order_ukraine' }
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
    // Сначала отправляем фото
    ctx.replyWithPhoto(
      { source: './assets/images/metlife.jpg' },
      {
        caption: '📸 Приклад поліса MetLife'
      }
    ).then(() => {
      // Затем отправляем текст с описанием
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
    }).catch(err => {
      console.log('Помилка при відправці фото:', err);
      // Если фото не отправилось, отправляем только текст
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
