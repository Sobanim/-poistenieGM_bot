import dotenv from 'dotenv';
dotenv.config();

// Единая точка определения окружения и учётных данных бота.
// Модуль НЕ имеет побочных эффектов (не запускает бота) — его безопасно
// импортировать как из локальной точки входа (index.js, long-polling),
// так и из serverless-точки входа (api/webhook.js).
export const isDevelopment = process.env.NODE_ENV === 'development';
export const botToken = isDevelopment ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;
export const adminId = isDevelopment ? process.env.DEV_ADMIN_ID : process.env.ADMIN_ID;
