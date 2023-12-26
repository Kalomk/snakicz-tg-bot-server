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
exports.bot = exports.prisma = exports.webAppUrl = exports.group_chat_for_payment = exports.group_chat = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const utils_1 = require("./src/utils");
const eventHandlers_1 = require("./src/eventHandlers");
const webDataHandler_1 = require("./src/webDataHandler");
const client_1 = require("@prisma/client");
const services_1 = require("./src/services");
const cors_1 = __importDefault(require("cors"));
dotenv.config();
// Constants
const _token = process.env.TOKEN || '';
//exported consts
exports.group_chat = process.env.GROUP_CHAT || '';
exports.group_chat_for_payment = process.env.GROUP_CHAT_FOR_PAYMENT || '';
exports.webAppUrl = process.env.WEB_URL || '';
// Create Express app
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Create Telegram Bot
exports.bot = new node_telegram_bot_api_1.default(_token, { polling: true });
exports.bot.on('polling_error', console.log);
// Function to handle the /start command
function handleStartCommand(msg) {
    exports.bot.removeListener('contact', eventHandlers_1.EH_contactHandler);
    const chatId = msg.chat.id;
    const startMessage = 'Вас вітає чат-бот Snakicz 🐟\nДля оформления замовлення, будь ласка, поділіться своїм номером телефону 👇🏻\nВи також можете оформити замовлення у нашого менеджера в [телеграм](https://t.me/snakicz_manager) або [інстаграм](https://www.instagram.com/snakicz/)';
    const contactKeyboard = [[{ text: 'Мій телефон', request_contact: true }], ['Вийти']];
    (0, utils_1.UT_sendKeyboardMessage)(exports.bot, chatId, startMessage, contactKeyboard);
    exports.bot.once('contact', eventHandlers_1.EH_contactHandler);
}
//events
exports.bot.on('callback_query', (callbackQuery) => (0, eventHandlers_1.EH_onCallbackQuery)(callbackQuery, exports.group_chat));
// Command handlers
exports.bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    exports.bot.sendMessage(chatId, resp);
});
exports.bot.onText(/\/start/, (msg) => {
    handleStartCommand(msg);
});
exports.bot.onText(/\Почати знову/, (msg) => {
    handleStartCommand(msg);
});
exports.bot.onText(/\Вийти/, (msg) => {
    handleStartCommand(msg);
});
exports.bot.onText(/\/restart/, (msg) => {
    handleStartCommand(msg);
});
//routes
app.post('/userInfo', async (req, res) => {
    const { chatId } = req.body;
    const orders = await services_1.Orders.getOrdersByUserId(chatId);
    return res.json(orders);
});
app.post('/lastOrder', async (req, res) => {
    const { chatId } = req.body;
    const orders = await services_1.Orders.getLastAddedOrderForUser(chatId);
    return res.json(orders);
});
app.post('/webData', async (req, _) => {
    (0, webDataHandler_1.webDataHandler)(req.body);
});
app.get('/getAllUsers', async (_, res) => {
    const users = await services_1.Users.getAllUsers();
    return res.json(users);
});
app.delete('/userDelete', async (req, _) => {
    const { chatId } = req.body;
    services_1.Users.userDelete(chatId);
});
app.get('/getAllOrders', async (_, res) => {
    const orders = await services_1.Orders.getAllOrders();
    return res.json(orders);
});
app.delete('/orderDelete', async (req, _) => {
    const { orderNumber } = req.body;
    services_1.Orders.orderDelete(orderNumber);
});
app.get('/getProducts', async (_, res) => {
    const products = await services_1.Product.getProducts();
    return res.json(products);
});
app.post('/addNewProduct', async (req, _) => {
    try {
        const { newProduct } = req.body;
        if (newProduct) {
            const product = services_1.Product.createANewProduct(newProduct);
            return product;
        }
    }
    catch (e) {
        console.log(e);
    }
});
app.put('/updateProduct', async (req, _) => {
    try {
        const { id, updatedData } = req.body;
        const updatedProduct = services_1.Product.updateProduct({ id, newData: updatedData });
        return updatedProduct;
    }
    catch (e) {
        console.log(e);
    }
});
// Start the Express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
//# sourceMappingURL=index.js.map