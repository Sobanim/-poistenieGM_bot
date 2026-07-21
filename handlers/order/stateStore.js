// Persistent storage for user state.
//
// In production on Vercel (serverless), each Telegram update is handled by a
// separate function invocation, and a plain in-memory `Map` does NOT survive
// between invocations (different/cold instances). This is what broke the
// step-by-step order flow and "share phone number". This module uses the
// Redis REST API (Vercel KV / Upstash) if configured, otherwise falls back
// to an in-memory store (convenient for local development).
//
// How to enable in production: set the environment variables
//   KV_REST_API_URL + KV_REST_API_TOKEN            (Vercel KV)
//   or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash directly)

const REST_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const useRedis = Boolean(REST_URL && REST_TOKEN);

// Lifetime of an unfinished order session (sec). Old sessions expire on their own.
const STATE_TTL_SECONDS = 60 * 60; // 1 hour

// Fallback store for local runs (long-polling — a single process).
const memoryStore = new Map();

if (!useRedis) {
  console.warn(
    '[stateStore] Redis is not configured — using the in-memory store. ' +
    'In serverless production (Vercel) the state will be lost between requests! ' +
    'Set KV_REST_API_URL/KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_*).'
  );
}

function key(userId) {
  return `order_state:${userId}`;
}

// Runs a single Redis command via the REST API (Upstash/Vercel KV).
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

// Get the user's state (or undefined).
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

// Fully write the user's state.
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

// Partially update the state (merges with the current one).
export async function updateUserState(userId, updates) {
  const current = (await getUserState(userId)) || { step: null, data: {} };
  const next = { ...current, ...updates };
  await setUserState(userId, next);
  return next;
}

// Delete the user's state.
export async function clearUserState(userId) {
  if (!useRedis) {
    memoryStore.delete(userId);
    return;
  }

  await redisCommand(['DEL', key(userId)]);
}
