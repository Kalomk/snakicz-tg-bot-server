"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webAppUrl = exports.group_chat_for_payment = exports.group_chat = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const utils_1 = require("./src/utils");
const eventHandlers_1 = require("./src/eventHandlers");
const sendingMesagesFuncs_1 = require("./src/sendingMesagesFuncs");
dotenv.config();
// Constants
const _token = process.env.TOKEN || '';
//exported consts
exports.group_chat = process.env.GROUP_CHAT || '';
exports.group_chat_for_payment = process.env.GROUP_CHAT_FOR_PAYMENT || '';
exports.webAppUrl = process.env.WEB_URL || '';
let orderNumber = {};
let userPhoneNumber = {};
let userFirstTimeClick = {};
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// Create Telegram Bot
const bot = new node_telegram_bot_api_1.default(_token, { polling: true });
bot.on('polling_error', console.log);
// Function to handle the /start command
function handleStartCommand(msg) {
    bot.removeAllListeners();
    const chatId = msg.chat.id;
    const startMessage = 'Вас вітає чат-бот Snakicz 🐟\nДля оформления замовлення, будь ласка, поділіться своїм номером телефону 👇🏻\nВи також можете оформити замовлення у нашого менеджера в [телеграм](https://t.me/snakicz_manager) або [інстаграм](https://www.instagram.com/snakicz/)';
    const contactKeyboard = [[{ text: 'Мій телефон', request_contact: true }], ['Вийти']];
    (0, utils_1.UT_sendKeyboardMessage)(bot, chatId, startMessage, contactKeyboard);
    bot.once('contact', (msg) => (0, eventHandlers_1.EH_contactHandler)(bot, msg, userPhoneNumber, orderNumber, userFirstTimeClick));
    bot.on('web_app_data', (msg) => (0, eventHandlers_1.EH_webDataHandler)(bot, msg, orderNumber, userPhoneNumber, userFirstTimeClick));
    bot.on('callback_query', (callbackQuery) => (0, sendingMesagesFuncs_1.SM_onCallbackQuery)(bot, callbackQuery, orderNumber));
}
// Command handlers
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
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
// Start the Express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
//# sourceMappingURL=index.js.map