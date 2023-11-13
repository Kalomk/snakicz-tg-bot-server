"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UT_sendKeyboardMessage = void 0;
// Helper function to send a message with a keyboard
function UT_sendKeyboardMessage(bot, chatId, text, keyboard) {
    const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            one_time_keyboard: true,
            keyboard,
        },
    };
    bot.sendMessage(chatId, text, options);
}
exports.UT_sendKeyboardMessage = UT_sendKeyboardMessage;
//# sourceMappingURL=utils.js.map