// User state is kept in persistent storage (see stateStore.js).
// Re-export the functions so other modules can keep importing them from here as before.
import {
  getUserState,
  setUserState,
  updateUserState,
  clearUserState
} from './stateStore.js';
// adminId comes from the shared environment module so dev mode works
// (DEV_ADMIN_ID when NODE_ENV=development). See config/env.js.
import { adminId } from '../../config/env.js';

export { getUserState, updateUserState, clearUserState };

// Insurance types available for ordering
export const insuranceTypes = {
  ukraine: '🇺🇦 Українське туристичне',
  axa: '🇸🇰 Словацьке екстрене (AXA)',
  union: '🇸🇰 Словацьке медичне (Union)',
  life: '🌍 Міжнародне страхування життя'
};

// Order process steps
export const orderSteps = {
  SELECTING_INSURANCE: 'selecting_insurance',
  ENTERING_FULL_NAME: 'entering_full_name',
  ENTERING_AGE: 'entering_age',
  ENTERING_CONTACT: 'entering_contact',
  CONFIRMATION: 'confirmation'
};

// Start the order process
export async function handleOrderStart(ctx) {
  await ctx.reply('Оберіть тип страхування для замовлення:', {
    reply_markup: {
      inline_keyboard: [
        [
          // { text: '🇺🇦 Українське туристичне', callback_data: 'order_ukraine' },
          { text: '🇸🇰 Словацьке екстрене (AXA)', callback_data: 'order_axa' },
          { text: '🇸🇰 Словацьке медичне (Union)', callback_data: 'order_union' },
        ],
        [
          { text: '🌍 Міжнародне страхування життя', callback_data: 'order_life' }
        ],
        [
          { text: '🤔 Не знаю що замовити', callback_data: 'help_choose' }
        ],
        [
          { text: '← Повернутися до головного меню', callback_data: 'main_menu' }
        ]
      ]
    }
  });
}

// Handle the insurance type selection
export async function handleInsuranceSelection(ctx, insuranceType) {
  const userId = ctx.from.id;

  console.log(`[DEBUG] handleInsuranceSelection - userId: ${userId}, insuranceType: ${insuranceType}`);

  // Initialize the user's state
  const newState = {
    step: orderSteps.ENTERING_FULL_NAME,
    insuranceType: insuranceType,
    data: {}
  };

  await setUserState(userId, newState);

  console.log(`[DEBUG] State set for user ${userId}:`, JSON.stringify(newState, null, 2));

  const insuranceName = insuranceTypes[insuranceType];

  await ctx.reply(
    `Ви обрали: ${insuranceName}\n\n` +
    'Будь ласка введіть ваше імʼя та прізвище \n' +
    'Приклад: Ivan Prokopenko',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '← Змінити тип страхування', callback_data: 'order_insurance' }],
          [{ text: '← Головне меню', callback_data: 'main_menu' }]
        ]
      }
    }
  );
}

// Validate the full name
export function validateFullName(name) {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Ім\'я не може бути порожнім' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 3) {
    return { isValid: false, error: 'Ім\'я повинно містити щонайменше 3 символи' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Ім\'я не може містити більше 100 символів' };
  }

  // Check that there are at least 2 words (first and last name)
  const words = trimmedName.split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, error: 'Введіть прізвище та ім\'я (мінімум 2 слова)' };
  }

  return { isValid: true, value: trimmedName };
}

// Validate the age
export function validateAge(ageInput) {
  if (!ageInput || typeof ageInput !== 'string') {
    return { isValid: false, error: 'Вік не може бути порожнім' };
  }

  const age = parseInt(ageInput.trim());

  if (isNaN(age)) {
    return { isValid: false, error: 'Вік повинен бути числом' };
  }

  if (age > 120) {
    return { isValid: false, error: 'Вік не може бути більше 120 років' };
  }

  return { isValid: true, value: age };
}

// Validate the contact
export function validateContact(contact) {
  if (!contact || typeof contact !== 'string') {
    return { isValid: false, error: 'Контакт не може бути порожнім' };
  }

  const trimmedContact = contact.trim();

  if (trimmedContact.length < 5) {
    return { isValid: false, error: 'Контакт повинен містити щонайменше 5 символів' };
  }

  // Check that it looks like a phone number
  const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;

  if (!phoneRegex.test(trimmedContact)) {
    return {
      isValid: false,
      error: 'Введіть дійсний номер телефону (мінімум 10 цифр)'
    };
  }

  return { isValid: true, value: trimmedContact };
}

// Send a notification to the admin.
// Returns true if the notification was delivered successfully, false otherwise —
// so the caller doesn't silently lose the submission.
export async function sendOrderNotificationToAdmin(bot, orderData, insuranceType, userId, userName) {
  if (!adminId || adminId === 'YOUR_ADMIN_ID_HERE') {
    console.error('⚠️ ADMIN_ID is not configured — there is no one to send the submission to!');
    return false;
  }

  // Format the date and time
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const insuranceName = insuranceTypes[insuranceType];

  // Build the admin message without problematic Markdown characters
  const adminMessage = `🔔 НОВА ЗАЯВКА НА СТРАХУВАННЯ

📋 Інформація про заявку:
• Тип страхування: ${insuranceName}
• Дата подачі: ${dateFormatted}
• Час подачі: ${timeFormatted}

👤 Дані клієнта:
• Повне ім'я: ${orderData.fullName}
• Вік: ${orderData.age} років
• Контакт: ${orderData.contact}

📱 Інформація про користувача Telegram:
• User ID: ${userId}
• Username: ${userName || 'Не вказано'}

---
⏰ Заявка отримана: ${dateFormatted} о ${timeFormatted}`;

  try {
    await bot.telegram.sendMessage(adminId, adminMessage);
    console.log(`✅ Admin notification sent for order from user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return false;
  }
}

// Finalize the order
export async function finalizeOrder(ctx, bot) {
  const userId = ctx.from.id;
  const userName = ctx.from.username;
  const userState = await getUserState(userId);

  if (!userState || userState.step !== orderSteps.CONFIRMATION) {
    await ctx.reply('❌ Помилка: дані замовлення не знайдено. Почніть заново — /start.');
    return;
  }

  // Notify the admin
  const notified = await sendOrderNotificationToAdmin(
    bot,
    userState.data,
    userState.insuranceType,
    userId,
    userName
  );

  // If the submission couldn't be delivered — don't lose it silently:
  // log the full data and let the user retry, without clearing the state.
  if (!notified) {
    console.error(
      '❌ SUBMISSION NOT DELIVERED to the admin. Data for manual recovery:',
      JSON.stringify({
        userId,
        userName,
        insuranceType: userState.insuranceType,
        ...userState.data
      })
    );

    await ctx.reply(
      '⚠️ Не вдалося відправити заявку. Спробуйте ще раз за мить.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Спробувати ще раз', callback_data: 'confirm_order' }],
            [{ text: '🏠 Головне меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
    return;
  }

  // Clear the user's state
  await clearUserState(userId);

  // Notify the user that the order was submitted successfully
  const successMessage = `
✅ **Ваша заявка успішно відправлена!**

Дякуємо за вибір наших послуг страхування. 
Ваша заявка передана нашим спеціалістам і незабаром з вами зв'яжуться для уточнення деталей.

📞 **Що далі?**
• Наш менеджер зв'яжеться з вами найближчим часом
• Підготуйте необхідні документи
• Очікуйте дзвінка або повідомлення

Бажаєте замовити ще одну страховку або повернутися до головного меню?
  `.trim();

  await ctx.reply(successMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📝 Замовити ще одну страховку', callback_data: 'order_insurance' },
        ],
        [
          { text: '🏠 Головне меню', callback_data: 'main_menu' }
        ]
      ]
    }
  });
}
