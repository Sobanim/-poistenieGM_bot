import { Telegraf } from 'telegraf';
import { setupBotHandlers } from './config/botHandlers.js';
import { botToken, adminId, isDevelopment } from './config/env.js';

const bot = new Telegraf(botToken);

// Add variables to the context for use in handlers
bot.use((ctx, next) => {
  ctx.bot = bot;
  ctx.adminId = adminId;
  ctx.isDevelopment = isDevelopment;
  return next();
});

// Set up handlers via the shared function
setupBotHandlers(bot);

bot.launch().then(() => {
  console.log('Bot started!');
  console.log('Waiting for messages...');
  console.log('Bot ID:', bot.botInfo?.id || 'Not received');
  console.log('Bot username:', bot.botInfo?.username || 'Not received');
}).catch((err) => {
  console.error('Bot startup error:', err);
});
