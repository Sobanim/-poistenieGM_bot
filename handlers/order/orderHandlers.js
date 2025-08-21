// Хранилище состояний пользователей (в продакшне лучше использовать базу данных)
const userStates = new Map();

// Типы страховок для заказа
export const insuranceTypes = {
  ukraine: '🇺🇦 Українське туристичне',
  axa: '🇸🇰 Словацьке екстрене (AXA)',
  union: '🇸🇰 Словацьке медичне (Union)',
  life: '🌍 Міжнародне ризикове життя'
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
export function handleOrderStart(ctx) {
  ctx.reply('Оберіть тип страхування для замовлення:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇺🇦 Українське туристичне', callback_data: 'order_ukraine' },
          { text: '🇸🇰 Словацьке екстрене (AXA)', callback_data: 'order_axa' }
        ],
        [
          { text: '🇸🇰 Словацьке медичне (Union)', callback_data: 'order_union' },
          { text: '🌍 Міжнародне ризикове життя', callback_data: 'order_life' }
        ],
        [
          { text: '← Повернутися до головного меню', callback_data: 'main_menu' }
        ]
      ]
    }
  });
}

// Обработка выбора типа страховки
export function handleInsuranceSelection(ctx, insuranceType) {
  const userId = ctx.from.id;

  // Инициализируем состояние пользователя
  userStates.set(userId, {
    step: orderSteps.ENTERING_FULL_NAME,
    insuranceType: insuranceType,
    data: {}
  });

  const insuranceName = insuranceTypes[insuranceType];

  ctx.reply(
    `Ви обрали: ${insuranceName}\n\n` +
    'Будь ласка, введіть ваше повне ім\'я (Прізвище Ім\'я По батькові):',
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

  // Проверяем на email или телефон
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;

  if (!emailRegex.test(trimmedContact) && !phoneRegex.test(trimmedContact)) {
    return {
      isValid: false,
      error: 'Введіть дійсний email або номер телефону (мінімум 10 цифр)'
    };
  }

  return { isValid: true, value: trimmedContact };
}

// Получение состояния пользователя
export function getUserState(userId) {
  return userStates.get(userId);
}

// Обновление состояния пользователя
export function updateUserState(userId, updates) {
  const currentState = userStates.get(userId) || { step: null, data: {} };
  const newState = { ...currentState, ...updates };
  userStates.set(userId, newState);
  return newState;
}

// Очистка состояния пользователя
export function clearUserState(userId) {
  userStates.delete(userId);
}

// Функция для отправки уведомления администратору
export async function sendOrderNotificationToAdmin(bot, orderData, insuranceType, userId, userName) {
  const adminId = process.env.ADMIN_ID;

  if (!adminId || adminId === 'YOUR_ADMIN_ID_HERE') {
    console.log('⚠️ ADMIN_ID не настроен в .env файле');
    return;
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
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления администратору:', error);
  }
}

// Функция для финализации заказа
export async function finalizeOrder(ctx, bot) {
  const userId = ctx.from.id;
  const userName = ctx.from.username;
  const userState = getUserState(userId);

  if (!userState || userState.step !== orderSteps.CONFIRMATION) {
    ctx.reply('❌ Помилка: дані замовлення не знайдено. Почніть заново.');
    return;
  }

  // Отправляем уведомление администратору
  await sendOrderNotificationToAdmin(
    bot,
    userState.data,
    userState.insuranceType,
    userId,
    userName
  );

  // Очищаем состояние пользователя
  clearUserState(userId);

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
