import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { useControllers } from './src/utils';
import { startBot } from './src/bot';

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
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // You can also use '*' to allow requests from any origin during development
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Create Telegram Bot
export const bot: TelegramBot = new TelegramBot(_token, { polling: true });

//startBot

startBot();

//routes
useControllers(app);

// Start the Express server

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
