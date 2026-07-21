// Постоянное хранилище состояний пользователей.
//
// В продакшене на Vercel (serverless) каждый апдейт от Telegram обрабатывается
// отдельным вызовом функции, и обычный `Map` в памяти НЕ переживает между вызовами
// (разные/холодные инстансы). Из-за этого пошаговый заказ и «поділитися номером»
// ломались. Здесь используется Redis REST API (Vercel KV / Upstash), если он
// настроен, иначе — fallback на память (удобно для локальной разработки).
//
// Как включить в проде: задать переменные окружения
//   KV_REST_API_URL + KV_REST_API_TOKEN            (Vercel KV)
//   или UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash напрямую)

const REST_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const useRedis = Boolean(REST_URL && REST_TOKEN);

// Время жизни незавершённой сессии заказа (сек). Старые сессии удаляются сами.
const STATE_TTL_SECONDS = 60 * 60; // 1 час

// Fallback-хранилище для локального запуска (long-polling — один процесс).
const memoryStore = new Map();

if (!useRedis) {
  console.warn(
    '[stateStore] Redis не настроен — используется хранилище в памяти. ' +
    'В serverless-проде (Vercel) состояние будет теряться между запросами! ' +
    'Задайте KV_REST_API_URL/KV_REST_API_TOKEN (или UPSTASH_REDIS_REST_*).'
  );
}

function key(userId) {
  return `order_state:${userId}`;
}

// Выполняет одну команду Redis через REST API (Upstash/Vercel KV).
async function redisCommand(command) {
  const res = await fetch(REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Redis request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.result;
}

// Получить состояние пользователя (или undefined).
export async function getUserState(userId) {
  if (!useRedis) {
    return memoryStore.get(userId);
  }

  const raw = await redisCommand(['GET', key(userId)]);
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// Полностью записать состояние пользователя.
export async function setUserState(userId, state) {
  if (!useRedis) {
    memoryStore.set(userId, state);
    return state;
  }

  await redisCommand([
    'SET',
    key(userId),
    JSON.stringify(state),
    'EX',
    String(STATE_TTL_SECONDS)
  ]);
  return state;
}

// Частично обновить состояние (мержит с текущим).
export async function updateUserState(userId, updates) {
  const current = (await getUserState(userId)) || { step: null, data: {} };
  const next = { ...current, ...updates };
  await setUserState(userId, next);
  return next;
}

// Удалить состояние пользователя.
export async function clearUserState(userId) {
  if (!useRedis) {
    memoryStore.delete(userId);
    return;
  }

  await redisCommand(['DEL', key(userId)]);
}
