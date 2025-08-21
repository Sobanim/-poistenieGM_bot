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

  // Проверяем что нет цифр и специальных символов
  const nameRegex = /^[а-яё\s'-.]+$/i;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Ім\'я може містити тільки літери, пробіли, апострофи та дефіси' };
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

  if (age < 16) {
    return { isValid: false, error: 'Вік повинен бути не менше 16 років' };
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
