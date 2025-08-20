import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { handleStart, handleCallbackQuery } from './handlers/basicHandlers.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(handleStart);
bot.on('callback_query', handleCallbackQuery);

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

app.get('/webhook', (req, res) => {
    res.send('Webhook endpoint is working!');
});

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
