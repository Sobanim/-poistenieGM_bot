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

// Escape special characters for legacy Markdown (parse_mode: 'Markdown'),
// so that user data (e.g. a name containing *, _, [, `)
// doesn't break the message formatting.
function escapeMarkdown(text) {
  return String(text).replace(/([_*[`])/g, '\\$1');
}

// Handle text messages within the order flow
export async function handleOrderTextMessage(ctx) {
  const userId = ctx.from.id;
  const userState = await getUserState(userId);

  console.log(`[DEBUG] handleOrderTextMessage - userId: ${userId}`);

  if (!userState || !userState.step) {
    console.log(`[DEBUG] User ${userId} is not in the order flow or has no step`);
    return false; // The user is not in the order flow
  }

  const messageText = ctx.message?.text;
  console.log(`[DEBUG] Received message from ${userId}, current step: ${userState.step}`);

  if (!messageText) {
    console.log(`[DEBUG] No text in the message from user ${userId}`);
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
    console.log(`[DEBUG] Unknown step: ${userState.step} for user ${userId}`);
    return false;
  }

  return true; // The message was handled
}

// Handle full name input
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

  // Save the name and move to the next step
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

// Handle age input
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

  // Save the age and move to contact input
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

// Handle contact input
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

  // Save the contact and move to confirmation
  const finalData = { ...userState.data, contact: validation.value };
  await updateUserState(userId, {
    step: orderSteps.CONFIRMATION,
    data: finalData
  });

  await showOrderConfirmation(ctx, userState.insuranceType, finalData);
}

// Show the order confirmation
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

// Handle a contact shared via Telegram (the "Share phone number" button)
export async function handlePhoneContact(ctx) {
  const userId = ctx.from.id;
  const userState = await getUserState(userId);

  if (!userState || userState.step !== orderSteps.ENTERING_CONTACT) {
    // Session lost/expired — give feedback instead of staying silent.
    await ctx.reply(
      'Сесія замовлення застаріла або не активна. Почніть заново — /start.',
      { reply_markup: { remove_keyboard: true } }
    );
    return false;
  }

  const phoneNumber = ctx.message.contact.phone_number;

  // Save the phone number
  const finalData = { ...userState.data, contact: phoneNumber };
  await updateUserState(userId, {
    step: orderSteps.CONFIRMATION,
    data: finalData
  });

  // Remove the reply keyboard and confirm receipt
  await ctx.reply('✅ Номер телефону збережено!', {
    reply_markup: { remove_keyboard: true }
  });
  await showOrderConfirmation(ctx, userState.insuranceType, finalData);

  return true;
}

// Handle edit button callbacks
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

// Confirm the order
export async function handleOrderConfirmation(ctx) {
  // Use the shared function to finalize the order
  await finalizeOrder(ctx, ctx.bot);
}

// Cancel the order
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
