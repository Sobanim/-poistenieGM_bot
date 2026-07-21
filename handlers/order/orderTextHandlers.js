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

// Экранирование спецсимволов легаси-Markdown (parse_mode: 'Markdown'),
// чтобы данные пользователя (например имя с символами *, _, [, `)
// не ломали форматирование сообщения.
function escapeMarkdown(text) {
  return String(text).replace(/([_*[`])/g, '\\$1');
}

// Обработка текстовых сообщений в процессе заказа
export async function handleOrderTextMessage(ctx) {
  const userId = ctx.from.id;
  const userState = await getUserState(userId);

  console.log(`[DEBUG] handleOrderTextMessage - userId: ${userId}`);

  if (!userState || !userState.step) {
    console.log(`[DEBUG] Пользователь ${userId} не в процессе заказа или нет шага`);
    return false; // Пользователь не в процессе заказа
  }

  const messageText = ctx.message?.text;
  console.log(`[DEBUG] Получено сообщение от ${userId}, текущий шаг: ${userState.step}`);

  if (!messageText) {
    console.log(`[DEBUG] Нет текста в сообщении от пользователя ${userId}`);
    return false;
  }

  switch (userState.step) {
  case orderSteps.ENTERING_FULL_NAME:
    await handleFullNameInput(ctx, messageText, userId, userState);
    break;

  case orderSteps.ENTERING_AGE:
    await handleAgeInput(ctx, messageText, userId, userState);
    break;

  case orderSteps.ENTERING_CONTACT:
    await handleContactInput(ctx, messageText, userId, userState);
    break;

  default:
    console.log(`[DEBUG] Неизвестный шаг: ${userState.step} для пользователя ${userId}`);
    return false;
  }

  return true; // Сообщение обработано
}

// Обработка ввода полного имени
async function handleFullNameInput(ctx, fullName, userId, userState) {
  const validation = validateFullName(fullName);

  if (!validation.isValid) {
    await ctx.reply(
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
  await updateUserState(userId, {
    step: orderSteps.ENTERING_AGE,
    data: { ...userState.data, fullName: validation.value }
  });

  await ctx.reply(
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
async function handleAgeInput(ctx, ageInput, userId, userState) {
  const validation = validateAge(ageInput);

  if (!validation.isValid) {
    await ctx.reply(
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
  await updateUserState(userId, {
    step: orderSteps.ENTERING_CONTACT,
    data: { ...userState.data, age: validation.value }
  });

  await ctx.reply(
    `✅ Вік збережено: ${validation.value} років\n\n` +
    'Тепер поділіться номером телефону кнопкою нижче або введіть його вручну:',
    {
      reply_markup: {
        keyboard: [
          [{ text: '📱 Поділитися номером телефону', request_contact: true }]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    }
  );
}

// Обработка ввода контакта
async function handleContactInput(ctx, contactInput, userId, userState) {
  const validation = validateContact(contactInput);

  if (!validation.isValid) {
    await ctx.reply(
      `❌ ${validation.error}\n\n` +
      'Будь ласка, введіть ваш номер телефону ще раз:',
      {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Поділитися номером телефону', request_contact: true }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    );
    return;
  }

  // Сохраняем контакт и переходим к подтверждению
  const finalData = { ...userState.data, contact: validation.value };
  await updateUserState(userId, {
    step: orderSteps.CONFIRMATION,
    data: finalData
  });

  await showOrderConfirmation(ctx, userState.insuranceType, finalData);
}

// Показать подтверждение заказа
async function showOrderConfirmation(ctx, insuranceType, orderData) {
  const insuranceName = insuranceTypes[insuranceType];

  const confirmationText =
    '📋 **Підтвердження замовлення**\n\n' +
    `**Тип страхування:** ${escapeMarkdown(insuranceName)}\n` +
    `**Повне ім'я:** ${escapeMarkdown(orderData.fullName)}\n` +
    `**Вік:** ${escapeMarkdown(orderData.age)} років\n` +
    `**Контакт:** ${escapeMarkdown(orderData.contact)}\n\n` +
    'Перевірте дані та підтвердіть замовлення:';

  await ctx.reply(confirmationText, {
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

// Обработка контакта из Telegram (кнопка «Поділитися номером телефону»)
export async function handlePhoneContact(ctx) {
  const userId = ctx.from.id;
  const userState = await getUserState(userId);

  if (!userState || userState.step !== orderSteps.ENTERING_CONTACT) {
    // Сессия потеряна/устарела — даём обратную связь вместо тишины.
    await ctx.reply(
      'Сесія замовлення застаріла або не активна. Почніть заново — /start.',
      { reply_markup: { remove_keyboard: true } }
    );
    return false;
  }

  const phoneNumber = ctx.message.contact.phone_number;

  // Сохраняем номер телефона
  const finalData = { ...userState.data, contact: phoneNumber };
  await updateUserState(userId, {
    step: orderSteps.CONFIRMATION,
    data: finalData
  });

  // Убираем reply-клавиатуру и подтверждаем получение
  await ctx.reply('✅ Номер телефону збережено!', {
    reply_markup: { remove_keyboard: true }
  });
  await showOrderConfirmation(ctx, userState.insuranceType, finalData);

  return true;
}

// Обработка кнопок редактирования
export async function handleEditCallbacks(ctx, action) {
  const userId = ctx.from.id;
  const userState = await getUserState(userId);

  if (!userState) {
    await ctx.reply('Помилка: дані замовлення не знайдено. Почніть заново — /start.');
    return;
  }

  switch (action) {
  case 'edit_fullname':
    await updateUserState(userId, { step: orderSteps.ENTERING_FULL_NAME });
    await ctx.reply(
      'Введіть ваше повне ім\'я (Прізвище Ім\'я):',
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
    await updateUserState(userId, { step: orderSteps.ENTERING_AGE });
    await ctx.reply(
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
    await ctx.reply(
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
    await updateUserState(userId, { step: orderSteps.ENTERING_CONTACT });
    await ctx.reply(
      'Поділіться номером телефону кнопкою нижче або введіть його вручну:',
      {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Поділитися номером телефону', request_contact: true }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    );
    break;

  case 'back_to_confirmation':
    await showOrderConfirmation(ctx, userState.insuranceType, userState.data);
    break;
  }
}

// Подтверждение заказа
export async function handleOrderConfirmation(ctx) {
  // Используем новую функцию для финализации заказа
  await finalizeOrder(ctx, ctx.bot);
}

// Отмена заказа
export async function handleOrderCancellation(ctx) {
  const userId = ctx.from.id;
  await clearUserState(userId);

  await ctx.reply(
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
