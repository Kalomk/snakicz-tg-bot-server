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
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("./src/utils");
const bot_1 = require("./src/bot");
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
app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // You can also use '*' to allow requests from any origin during development
    // res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// Create Telegram Bot
exports.bot = new node_telegram_bot_api_1.default(_token, { polling: true });
//startBot
bot_1.startBot;
//routes
(0, utils_1.useControllers)(app);
// Start the Express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
//# sourceMappingURL=index.js.map