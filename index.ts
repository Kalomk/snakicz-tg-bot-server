import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import * as dotenv from 'dotenv';
import { UT_sendKeyboardMessage } from './src/utils';
import { EH_contactHandler, EH_webDataHandler } from './src/eventHandlers';
import { SM_onCallbackQuery } from './src/sendingMesagesFuncs';
import { PrismaClient } from '@prisma/client';
import { getOrders } from './src/controllers/controller';

dotenv.config();

// Constants
const _token: string = process.env.TOKEN || '';
//exported consts
export const group_chat: string = process.env.GROUP_CHAT || '';
export const group_chat_for_payment: string = process.env.GROUP_CHAT_FOR_PAYMENT || '';
export const webAppUrl: string = process.env.WEB_URL || '';

let orderNumber: { [key: string]: string } = {};

// Create Express app
const app: express.Application = express();
export const prisma = new PrismaClient();

// Middleware
app.use(express.json());

// Create Telegram Bot
export const bot: TelegramBot = new TelegramBot(_token, { polling: true });
bot.on('polling_error', console.log);

// Function to handle the /start command
function handleStartCommand(msg: TelegramBot.Message) {
  bot.removeAllListeners();

  const chatId = msg.chat.id;

  const startMessage =
    'Вас вітає чат-бот Snakicz 🐟\nДля оформления замовлення, будь ласка, поділіться своїм номером телефону 👇🏻\nВи також можете оформити замовлення у нашого менеджера в [телеграм](https://t.me/snakicz_manager) або [інстаграм](https://www.instagram.com/snakicz/)';
  const contactKeyboard = [[{ text: 'Мій телефон', request_contact: true }], ['Вийти']];

  UT_sendKeyboardMessage(bot, chatId, startMessage, contactKeyboard);

  bot.once('contact', (msg) => EH_contactHandler(msg));

  bot.on('web_app_data', (msg) => EH_webDataHandler(msg));

  bot.on('callback_query', (callbackQuery) =>
    SM_onCallbackQuery(bot, callbackQuery, orderNumber, group_chat)
  );
}

// Command handlers
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match![1];
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/start/, (msg) => {
  handleStartCommand(msg);
});

bot.onText(/\Почати знову/, (msg) => {
  handleStartCommand(msg);
});

bot.onText(/\Вийти/, (msg) => {
  handleStartCommand(msg);
});

bot.onText(/\/restart/, (msg) => {
  handleStartCommand(msg);
});

//routes

app.post('/userInfo', async (req, res) => {
  const {chatId} = req.body

  const orders = await  getOrders(chatId)
  return res.status(500).json(orders);
});


// Start the Express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
