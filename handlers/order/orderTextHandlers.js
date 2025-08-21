import {
  orderSteps,
  validateFullName,
  validateAge,
  validateContact,
  getUserState,
  updateUserState,
  insuranceTypes,
  finalizeOrder,
  clearUserState
} from './orderHandlers.js';

// Обработка текстовых сообщений в процессе заказа
export function handleOrderTextMessage(ctx) {
  const userId = ctx.from.id;
  const userState = getUserState(userId);

  if (!userState || !userState.step) {
    return false; // Пользователь не в процессе заказа
  }

  const messageText = ctx.message?.text;

  switch (userState.step) {
  case orderSteps.ENTERING_FULL_NAME:
    handleFullNameInput(ctx, messageText, userId, userState);
    break;

  case orderSteps.ENTERING_AGE:
    handleAgeInput(ctx, messageText, userId, userState);
    break;

  case orderSteps.ENTERING_CONTACT:
    handleContactInput(ctx, messageText, userId, userState);
    break;

  default:
    return false;
  }

  return true; // Сообщение обработано
}

// Обработка ввода полного имени
function handleFullNameInput(ctx, fullName, userId, userState) {
  const validation = validateFullName(fullName);

  if (!validation.isValid) {
    ctx.reply(
      `❌ ${validation.error}\n\n` +
      'Будь ласка, введіть ваше повне ім\'я ще раз (Прізвище Ім\'я):',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← Змінити тип страхування', callback_data: 'order_insurance' }],
            [{ text: '← Головне меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
    return;
  }

  // Сохраняем имя и переходим к следующему шагу
  updateUserState(userId, {
    step: orderSteps.ENTERING_AGE,
    data: { ...userState.data, fullName: validation.value }
  });

  ctx.reply(
    `✅ Ім'я збережено: ${validation.value}\n\n` +
    'Тепер введіть ваш вік (повних років):',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '← Змінити ім\'я', callback_data: 'edit_fullname' }],
          [{ text: '← Головне меню', callback_data: 'main_menu' }]
        ]
      }
    }
  );
}

// Обработка ввода возраста
function handleAgeInput(ctx, ageInput, userId, userState) {
  const validation = validateAge(ageInput);

  if (!validation.isValid) {
    ctx.reply(
      `❌ ${validation.error}\n\n` +
      'Будь ласка, введіть ваш вік ще раз (тільки число):',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← Змінити ім\'я', callback_data: 'edit_fullname' }],
            [{ text: '← Головне меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
    return;
  }

  // Сохраняем возраст и переходим к контактам
  updateUserState(userId, {
    step: orderSteps.ENTERING_CONTACT,
    data: { ...userState.data, age: validation.value }
  });

  ctx.reply(
    `✅ Вік збережено: ${validation.value} років\n\n` +
    'Тепер введіть ваші контактні дані (email або номер телефону):',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Поділитися номером телефону',
              callback_data: 'share_phone'
            }
          ],
          [{ text: '← Змінити вік', callback_data: 'edit_age' }],
          [{ text: '← Головне меню', callback_data: 'main_menu' }]
        ]
      }
    }
  );
}

// Обработка ввода контакта
function handleContactInput(ctx, contactInput, userId, userState) {
  const validation = validateContact(contactInput);

  if (!validation.isValid) {
    ctx.reply(
      `❌ ${validation.error}\n\n` +
      'Будь ласка, введіть ваші контактні дані ще раз (email або номер телефону):',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 Поділитися номером телефону',
                callback_data: 'share_phone'
              }
            ],
            [{ text: '← Змінити вік', callback_data: 'edit_age' }],
            [{ text: '← Головне меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
    return;
  }

  // Сохраняем контакт и переходим к подтверждению
  const finalData = { ...userState.data, contact: validation.value };
  updateUserState(userId, {
    step: orderSteps.CONFIRMATION,
    data: finalData
  });

  showOrderConfirmation(ctx, userState.insuranceType, finalData);
}

// Показать подтверждение заказа
function showOrderConfirmation(ctx, insuranceType, orderData) {
  const insuranceName = insuranceTypes[insuranceType];

  const confirmationText =
    '📋 **Підтвердження замовлення**\n\n' +
    `**Тип страхування:** ${insuranceName}\n` +
    `**Повне ім'я:** ${orderData.fullName}\n` +
    `**Вік:** ${orderData.age} років\n` +
    `**Контакт:** ${orderData.contact}\n\n` +
    'Перевірте дані та підтвердіть замовлення:';

  ctx.reply(confirmationText, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Підтвердити замовлення', callback_data: 'confirm_order' },
          { text: '❌ Скасувати', callback_data: 'cancel_order' }
        ],
        [
          { text: '✏️ Редагувати дані', callback_data: 'edit_order_data' }
        ],
        [
          { text: '← Головне меню', callback_data: 'main_menu' }
        ]
      ]
    }
  });
}

// Обработка контакта из Telegram
export function handlePhoneContact(ctx) {
  const userId = ctx.from.id;
  const userState = getUserState(userId);

  if (!userState || userState.step !== orderSteps.ENTERING_CONTACT) {
    return false;
  }

  const phoneNumber = ctx.message.contact.phone_number;

  // Сохраняем номер телефона
  const finalData = { ...userState.data, contact: phoneNumber };
  updateUserState(userId, {
    step: orderSteps.CONFIRMATION,
    data: finalData
  });

  ctx.reply('✅ Номер телефону збережено!');
  showOrderConfirmation(ctx, userState.insuranceType, finalData);

  return true;
}

// Обработка кнопок редактирования
export function handleEditCallbacks(ctx, action) {
  const userId = ctx.from.id;
  const userState = getUserState(userId);

  if (!userState) {
    ctx.reply('Помилка: дані замовлення не знайдено. Почніть заново.');
    return;
  }

  switch (action) {
  case 'edit_fullname':
    updateUserState(userId, { step: orderSteps.ENTERING_FULL_NAME });
    ctx.reply(
      'Введіть ваше повне ім\'я (Прізвище Ім\'я По батькові):',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← Головне меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
    break;

  case 'edit_age':
    updateUserState(userId, { step: orderSteps.ENTERING_AGE });
    ctx.reply(
      'Введіть ваш вік (повних років):',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← Головне меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
    break;

  case 'edit_order_data':
    ctx.reply(
      'Що ви хочете змінити?',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👤 Змінити ім\'я', callback_data: 'edit_fullname' },
              { text: '🎂 Змінити вік', callback_data: 'edit_age' }
            ],
            [
              { text: '📞 Змінити контакт', callback_data: 'edit_contact' }
            ],
            [
              { text: '← Повернутися до підтвердження', callback_data: 'back_to_confirmation' }
            ]
          ]
        }
      }
    );
    break;

  case 'edit_contact':
    updateUserState(userId, { step: orderSteps.ENTERING_CONTACT });
    ctx.reply(
      'Введіть ваші контактні дані (email або номер телефону):',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 Поділитися номером телефону',
                callback_data: 'share_phone'
              }
            ],
            [{ text: '← Головне меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
    break;

  case 'back_to_confirmation':
    showOrderConfirmation(ctx, userState.insuranceType, userState.data);
    break;
  }
}

// Подтверждение заказа
export async function handleOrderConfirmation(ctx) {
  // Используем новую функцию для финализации заказа
  await finalizeOrder(ctx, ctx.bot);
}

// Отмена заказа
export function handleOrderCancellation(ctx) {
  const userId = ctx.from.id;
  clearUserState(userId);

  ctx.reply(
    '❌ Замовлення скасовано.\n\n' +
    'Ви можете почати заново в будь-який час.',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🏠 Головне меню', callback_data: 'main_menu' },
            { text: '📋 Замовити страховку', callback_data: 'order_insurance' }
          ]
        ]
      }
    }
  );
}
