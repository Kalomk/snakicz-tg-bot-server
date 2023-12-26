import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import * as dotenv from 'dotenv';
import { UT_sendImageToCloud, UT_sendKeyboardMessage } from './src/utils';
import { EH_contactHandler, EH_onCallbackQuery } from './src/eventHandlers';
import { webDataHandler } from './src/webDataHandler';
import { PrismaClient } from '@prisma/client';
import { Users, Orders, Product } from './src/services';
import cors from 'cors';

dotenv.config();

// Constants
const _token: string = process.env.TOKEN || '';
//exported consts
export const group_chat: string = process.env.GROUP_CHAT || '';
export const group_chat_for_payment: string = process.env.GROUP_CHAT_FOR_PAYMENT || '';
export const webAppUrl: string = process.env.WEB_URL || '';

// Create Express app
const app: express.Application = express();
export const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors());

// Create Telegram Bot
export const bot: TelegramBot = new TelegramBot(_token, { polling: true });
bot.on('polling_error', console.log);

// Function to handle the /start command
function handleStartCommand(msg: TelegramBot.Message) {
  bot.removeListener('contact', EH_contactHandler);

  const chatId = msg.chat.id;

  const startMessage =
    'Вас вітає чат-бот Snakicz 🐟\nДля оформления замовлення, будь ласка, поділіться своїм номером телефону 👇🏻\nВи також можете оформити замовлення у нашого менеджера в [телеграм](https://t.me/snakicz_manager) або [інстаграм](https://www.instagram.com/snakicz/)';
  const contactKeyboard = [[{ text: 'Мій телефон', request_contact: true }], ['Вийти']];

  UT_sendKeyboardMessage(bot, chatId, startMessage, contactKeyboard);

  bot.once('contact', EH_contactHandler);
}

//events
bot.on('callback_query', (callbackQuery) => EH_onCallbackQuery(callbackQuery, group_chat));

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
  const { chatId } = req.body;
  const orders = await Orders.getOrdersByUserId(chatId);
  return res.json(orders);
});

app.post('/lastOrder', async (req, res) => {
  const { chatId } = req.body;
  const orders = await Orders.getLastAddedOrderForUser(chatId);
  return res.json(orders);
});

app.post('/webData', async (req, _) => {
  webDataHandler(req.body);
});

app.get('/getAllUsers', async (_, res) => {
  const users = await Users.getAllUsers();
  return res.json(users);
});

app.delete('/userDelete', async (req, _) => {
  const { chatId } = req.body;
  Users.userDelete(chatId);
});

app.get('/getAllOrders', async (_, res) => {
  const orders = await Orders.getAllOrders();

  return res.json(orders);
});

app.delete('/orderDelete', async (req, _) => {
  const { orderNumber } = req.body;

  Orders.orderDelete(orderNumber);
});

app.get('/getProducts', async (_, res) => {
  const products = await Product.getProducts();

  return res.json(products);
});

app.post('/addNewProduct', async (req, _) => {
  try {
    const { newProduct } = req.body;
    if (newProduct) {
      const product = Product.createANewProduct(newProduct);
      return product;
    }
  } catch (e) {
    console.log(e);
  }
});

app.put('/updateProduct', async (req, _) => {
  try {
    const { id, updatedData } = req.body;
    const updatedProduct = Product.updateProduct({ id, newData: updatedData });
    return updatedProduct;
  } catch (e) {
    console.log(e);
  }
});

app.post('/postImageToCloud', async (req, res) => {
  try {
    console.log(req);
    const response = await UT_sendImageToCloud(req.body.image);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return 'none';
  }
});

// Start the Express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
