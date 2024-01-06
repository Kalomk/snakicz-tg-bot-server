"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBot = void 0;
const __1 = require("../..");
const eventHandlers_1 = require("./eventHandlers");
const __2 = require("../..");
const startBot = () => {
    //events
    __1.bot.on('callback_query', (callbackQuery) => (0, eventHandlers_1.EH_onCallbackQuery)(callbackQuery, __2.group_chat));
    __1.bot.on('polling_error', console.log);
    const commands = [/\/start/, /\Почати знову/, /\Вийти/, /\/restart/];
    // Command handlers
    __1.bot.onText(/\/echo (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const resp = match[1];
        __1.bot.sendMessage(chatId, resp);
    });
    commands.forEach((command) => {
        __1.bot.onText(command, (msg) => {
            (0, eventHandlers_1.EH_handleStartCommand)(msg);
        });
    });
};
exports.startBot = startBot;
//# sourceMappingURL=index.js.map