// Состояние пользователей хранится в постоянном хранилище (см. stateStore.js).
// Реэкспортируем функции, чтобы остальные модули импортировали их отсюда как раньше.
import {
  getUserState,
  setUserState,
  updateUserState,
  clearUserState
} from './stateStore.js';
// adminId берётся из общего модуля окружения, чтобы работал dev-режим
// (DEV_ADMIN_ID при NODE_ENV=development). См. config/env.js.
import { adminId } from '../../config/env.js';

export { getUserState, updateUserState, clearUserState };

// Типы страховок для заказа
export const insuranceTypes = {
  ukraine: '🇺🇦 Українське туристичне',
  axa: '🇸🇰 Словацьке екстрене (AXA)',
  union: '🇸🇰 Словацьке медичне (Union)',
  life: '🌍 Міжнародне страхування життя'
};

// Шаги процесса заказа
export const orderSteps = {
  SELECTING_INSURANCE: 'selecting_insurance',
  ENTERING_FULL_NAME: 'entering_full_name',
  ENTERING_AGE: 'entering_age',
  ENTERING_CONTACT: 'entering_contact',
  CONFIRMATION: 'confirmation'
};

// Инициация процесса заказа
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

// Обработка выбора типа страховки
export async function handleInsuranceSelection(ctx, insuranceType) {
  const userId = ctx.from.id;

  console.log(`[DEBUG] handleInsuranceSelection - userId: ${userId}, insuranceType: ${insuranceType}`);

  // Инициализируем состояние пользователя
  const newState = {
    step: orderSteps.ENTERING_FULL_NAME,
    insuranceType: insuranceType,
    data: {}
  };

  await setUserState(userId, newState);

  console.log(`[DEBUG] Состояние пользователя ${userId} установлено:`, JSON.stringify(newState, null, 2));

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

// Валидация полного имени
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

  // Проверяем что есть минимум 2 слова (имя и фамилия)
  const words = trimmedName.split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, error: 'Введіть прізвище та ім\'я (мінімум 2 слова)' };
  }

  return { isValid: true, value: trimmedName };
}

// Валидация возраста
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

// Валидация контакта
export function validateContact(contact) {
  if (!contact || typeof contact !== 'string') {
    return { isValid: false, error: 'Контакт не може бути порожнім' };
  }

  const trimmedContact = contact.trim();

  if (trimmedContact.length < 5) {
    return { isValid: false, error: 'Контакт повинен містити щонайменше 5 символів' };
  }

  // Проверяем на телефон
  const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;

  if (!phoneRegex.test(trimmedContact)) {
    return {
      isValid: false,
      error: 'Введіть дійсний номер телефону (мінімум 10 цифр)'
    };
  }

  return { isValid: true, value: trimmedContact };
}

// Функция для отправки уведомления администратору.
// Возвращает true, если уведомление успешно доставлено, иначе false —
// чтобы вызывающий код мог не потерять заявку молча.
export async function sendOrderNotificationToAdmin(bot, orderData, insuranceType, userId, userName) {
  if (!adminId || adminId === 'YOUR_ADMIN_ID_HERE') {
    console.error('⚠️ ADMIN_ID не настроен — заявку некому отправить!');
    return false;
  }

  // Форматируем дату и время
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

  // Формируем сообщение для администратора без проблемных Markdown символов
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
    console.log(`✅ Уведомление администратору отправлено для заявки пользователя ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления администратору:', error);
    return false;
  }
}

// Функция для финализации заказа
export async function finalizeOrder(ctx, bot) {
  const userId = ctx.from.id;
  const userName = ctx.from.username;
  const userState = await getUserState(userId);

  if (!userState || userState.step !== orderSteps.CONFIRMATION) {
    await ctx.reply('❌ Помилка: дані замовлення не знайдено. Почніть заново — /start.');
    return;
  }

  // Отправляем уведомление администратору
  const notified = await sendOrderNotificationToAdmin(
    bot,
    userState.data,
    userState.insuranceType,
    userId,
    userName
  );

  // Если заявку не удалось доставить — НЕ теряем её молча:
  // логируем полные данные и даём пользователю повторить, не очищая состояние.
  if (!notified) {
    console.error(
      '❌ ЗАЯВКА НЕ ДОСТАВЛЕНА адміну. Дані для ручного відновлення:',
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

  // Очищаем состояние пользователя
  await clearUserState(userId);

  // Уведомляем пользователя об успешной отправке
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
