"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EH_onCallbackQuery = exports.EH_contactHandler = exports.EH_handleStartCommand = void 0;
const __1 = require("../..");
const __2 = require("../..");
const sendingMesagesFuncs_1 = require("./sendingMesagesFuncs");
const userService_1 = require("../services/userService");
const utils_1 = require("../utils");
// Function to handle the /start command
function EH_handleStartCommand(msg) {
    __2.bot.removeListener('contact', EH_contactHandler);
    const chatId = msg.chat.id;
    const startMessage = 'Вас вітає чат-бот Snakicz 🐟\nДля оформления замовлення, будь ласка, поділіться своїм номером телефону 👇🏻\nВи також можете оформити замовлення у нашого менеджера в [телеграм](https://t.me/snakicz_manager) або [інстаграм](https://www.instagram.com/snakicz/)';
    const contactKeyboard = [[{ text: 'Мій телефон', request_contact: true }], ['Вийти']];
    (0, utils_1.UT_sendKeyboardMessage)(__2.bot, chatId, startMessage, contactKeyboard);
    __2.bot.once('contact', EH_contactHandler);
}
exports.EH_handleStartCommand = EH_handleStartCommand;
async function EH_contactHandler(msg) {
    const chatId = msg.chat.id;
    // Generate a random number between 1000 and 9999
    const phoneNumber = msg?.contact?.phone_number;
    await (0, userService_1.createOrFindExistUserService)({ uniqueId: chatId.toString(), phoneNumber }).then((user) => {
        const isFirstTimeBuy = user?.isFirstTimeBuy;
        const webUrl = isFirstTimeBuy ? __1.webAppUrl + '/priceSelect' : __1.webAppUrl;
        const thankYouMessage = "Дякуємо за контакти. Для продовження натисніть 'Магазин'";
        // UT_sendKeyboardMessage(bot, chatId, thankYouMessage, storeKeyboard);
        if (isFirstTimeBuy) {
            __2.bot.sendMessage(chatId, thankYouMessage, {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Магазин', web_app: { url: webUrl } }]],
                },
            });
        }
        else {
            __2.bot.sendMessage(chatId, 'Чи бажаєте повторити замовлення?', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Ні', web_app: { url: webUrl } }],
                        [{ text: 'Так', web_app: { url: __1.webAppUrl + '/prevOrders' } }],
                    ],
                },
            });
        }
    });
}
exports.EH_contactHandler = EH_contactHandler;
async function EH_onCallbackQuery(callbackQuery, group_id) {
    const action = JSON.parse(callbackQuery.data);
    const text = callbackQuery?.message?.text;
    const chatId = callbackQuery?.message?.chat.id;
    const messageId = callbackQuery?.message?.message_id;
    const keyboards = callbackQuery?.message?.reply_markup?.inline_keyboard;
    const userId = action?.chat_id;
    const messageIdGroup = action?.message_id;
    let orderNumberFromText;
    const orderNumberMatch = text?.match(/Номер замовлення:\s+(\d+)/);
    if (orderNumberMatch && orderNumberMatch[1]) {
        // Extracted order number
        orderNumberFromText = orderNumberMatch[1];
        console.log(`Order Number: ${orderNumberFromText}`);
    }
    else {
        console.log('Order number not found in the text.');
    }
    switch (action.confirm) {
        case 'confirm':
            (0, sendingMesagesFuncs_1.SM_confrimOrder)({ text, chatId, userId, messageId, keyboards });
            break;
        case 'privat':
            (0, sendingMesagesFuncs_1.SM_sendPaymentMessage)(chatId, action.confirm);
            break;
        case 'polish_bank':
            (0, sendingMesagesFuncs_1.SM_sendPaymentMessage)(chatId, action.confirm);
            break;
        case 'pay-confirm':
            (0, sendingMesagesFuncs_1.SM_paymentConfirm)({ text, chatId, userId, messageId, keyboards });
            break;
        case 'send-pack-number':
            (0, sendingMesagesFuncs_1.SM_sendOrderConfirmation)({
                text,
                chatId,
                userId,
                messageId,
                keyboards,
                orderNumberFromText: orderNumberFromText,
            });
            break;
        case 'sendPhoto':
            (0, sendingMesagesFuncs_1.SM_requestUserPhoto)(chatId);
            break;
        case 'actualize':
            (0, sendingMesagesFuncs_1.SM_actualizeInfo)({
                text,
                chatId,
                keyboards,
                userId,
                messageId,
                orderNumberFromText: orderNumberFromText,
            });
            break;
        case 'accept':
            (0, sendingMesagesFuncs_1.SM_userAcceptOrder)(__2.bot, group_id, orderNumberFromText);
            break;
        case 'decline':
            (0, sendingMesagesFuncs_1.SM_userDeclineOrder)({
                bot: __2.bot,
                chatId,
                group_id,
                messageId_group: messageIdGroup,
                messageId,
                orderNumberFromText: orderNumberFromText,
            });
            break;
    }
}
exports.EH_onCallbackQuery = EH_onCallbackQuery;
//# sourceMappingURL=eventHandlers.js.map