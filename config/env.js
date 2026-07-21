import dotenv from 'dotenv';
dotenv.config();

// Single source of truth for the environment and bot credentials.
// The module has NO side effects (it doesn't launch the bot) — it's safe
// to import from both the local entry point (index.js, long-polling)
// and the serverless entry point (api/webhook.js).
export const isDevelopment = process.env.NODE_ENV === 'development';
export const botToken = isDevelopment ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;
export const adminId = isDevelopment ? process.env.DEV_ADMIN_ID : process.env.ADMIN_ID;
