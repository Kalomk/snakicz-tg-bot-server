"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SM_sendOrderConfirmation = exports.SM_actualizeInfo = exports.SM_userAcceptOrder = exports.SM_userDeclineOrder = exports.SM_paymentConfirm = exports.SM_requestUserPhoto = exports.SM_sendPaymentMessage = exports.SM_confrimOrder = void 0;
const __1 = require("..");
const __2 = require("..");
const controller_1 = require("./controllers/controller");
function SM_confrimOrder({ chatId, userId, text, messageId, keyboards, }) {
    // Create a new array with the first element replaced
    const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
    updatedKeyboards[0] = [
        {
            text: 'Підтверженно!!!',
            callback_data: 'payment_confirmation',
        },
    ];
    const inlineKeyboard = [...updatedKeyboards];
    const paymentButtons = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'А-банк (курс 9)(в гривнях)',
                        callback_data: JSON.stringify({ confirm: 'privat', chat_id: chatId }),
                    },
                ],
                [
                    {
                        text: 'Переказ на польський рахунок',
                        callback_data: JSON.stringify({ confirm: 'polish_bank', chat_id: chatId }),
                    },
                ],
            ],
        },
    };
    __2.bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    });
    __2.bot.sendMessage(userId, 'Ваше замовлення підтверджено ✅ \n \nБудь ласка, оберіть зручний для Вас спосіб оплати: ', paymentButtons);
}
exports.SM_confrimOrder = SM_confrimOrder;
function SM_sendPaymentMessage(chatId, type) {
    function checkType(type) {
        switch (type) {
            case 'privat':
                return 'Номер картки: 4323357029261688\nПІБ отримувача: Демементьєва Анастасія\nКурс: 9\nСума: сума в злотих помножена на 9';
            case 'polish_bank':
                return 'Номер рахунку:\n18160014621731022840000001\nOтримувач: Snakicz\nБанк отримувача: BNP Paribas Tytuł: oplata zamówienia';
        }
    }
    __2.bot.sendMessage(chatId, `${checkType(type)}`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Надіслати cкрін-підтвердження',
                        callback_data: JSON.stringify({ confirm: 'sendPhoto', chat_id: chatId }),
                    },
                ],
            ],
        },
    });
}
exports.SM_sendPaymentMessage = SM_sendPaymentMessage;
function SM_requestUserPhoto(chat_id) {
    __2.bot.sendMessage(chat_id, 'Вишліть фотопідтвердження оплати,прикріпивши фото знизу 👇');
    // Listen for messages from the user
    __2.bot.once('photo', async (msg) => {
        const chatId = msg.chat.id;
        const orderNumber = await (0, controller_1.getLastAddedOrderForUser)(chatId).then(order => order?.orderNumber);
        if (msg.photo && msg.photo.length > 0) {
            // The `msg.photo` property is an array of photo sizes
            // You can access different sizes using indexes (0 - smallest, 2 - largest)
            const photo = msg.photo[msg.photo.length - 1];
            try {
                // Send the photo to the group chat
                await __2.bot.sendPhoto(__1.group_chat_for_payment, photo.file_id);
                __2.bot.sendMessage(__1.group_chat_for_payment, `Скрін підтвердження №${orderNumber}`);
                __2.bot.sendMessage(chatId, 'Фото підтвердження оплати відправлено 😍\nЧекайте на відправку');
            }
            catch (error) {
                console.error('Error sending photo:', error);
                __2.bot.sendMessage(chatId, 'Під час відправлення фото сталася помилка 😳\nСпробуйте знову');
                SM_requestUserPhoto(chatId);
            }
        }
        else {
            __2.bot.sendMessage(chatId, 'Повідомлення не містить фото підтвердження оплати');
            SM_requestUserPhoto(chatId);
        }
    });
}
exports.SM_requestUserPhoto = SM_requestUserPhoto;
function SM_paymentConfirm({ chatId, userId, text, messageId, keyboards, }) {
    // Create a new array with the first element replaced
    const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
    updatedKeyboards[1] = [
        {
            text: 'Оплату підтверджено!!!',
            callback_data: 'payment_confirmation',
        },
    ];
    const inlineKeyboard = [...updatedKeyboards];
    __2.bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    });
    __2.bot.sendMessage(userId, 'Вашу оплату підтверджено✅\nБудь ласка, очікуйте номер відправлення 📦');
}
exports.SM_paymentConfirm = SM_paymentConfirm;
function SM_userDeclineOrder({ chatId, group_id, messageId_group, messageId, orderNumberFromText, }) {
    __2.bot.editMessageText('Ваше замовлення було аннульоване!', {
        chat_id: chatId,
        message_id: messageId,
    });
    __2.bot.editMessageText(`Замовлення ${orderNumberFromText} відхилено`, {
        chat_id: group_id,
        message_id: messageId_group,
    });
}
exports.SM_userDeclineOrder = SM_userDeclineOrder;
function SM_userAcceptOrder(bot, groupId, orderNumberFromText) {
    bot.sendMessage(groupId, `Замовлення ${orderNumberFromText} продовжено`);
}
exports.SM_userAcceptOrder = SM_userAcceptOrder;
function SM_actualizeInfo({ chatId, keyboards, userId, messageId, text, orderNumberFromText, }) {
    const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
    updatedKeyboards[3] = [
        {
            text: 'Запит вислано (Натисніть знову щоб вислати запит знову)',
            callback_data: 'actualize',
        },
    ];
    const inlineKeyboard = [...updatedKeyboards];
    __2.bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    });
    const inlineKeyboardUser = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Так',
                        callback_data: JSON.stringify({ confirm: 'accept', message_id: messageId }),
                    },
                ],
                [
                    {
                        text: 'Ні',
                        callback_data: JSON.stringify({ confirm: 'decline', message_id: messageId }),
                    },
                ],
            ],
        },
    };
    __2.bot.sendMessage(userId, `Чи ваше замовлення ( Номер замовлення: ${orderNumberFromText} ) ще актуально?`, inlineKeyboardUser);
}
exports.SM_actualizeInfo = SM_actualizeInfo;
function SM_sendOrderConfirmation({ chatId, keyboards, userId, messageId, text, orderNumberFromText, }) {
    // Create a new array with the first element replaced
    const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
    updatedKeyboards[2] = [
        {
            text: 'Інформацію о посилці вислано (Знову вислати)!!!',
            callback_data: 'send-pack-number',
        },
    ];
    const inlineKeyboard = [...updatedKeyboards];
    __2.bot.sendMessage(__1.group_chat, `Надішліть інформацію про доставку посилки № ${orderNumberFromText}  через SPACE: 1) служба доставки 2) номер посилки`);
    __2.bot.once('message', async (msg) => {
        const textFromMsg = msg?.text;
        try {
            const messages = textFromMsg.split(' ');
            __2.bot.sendMessage(userId, `Ваше замовлення № ${orderNumberFromText} відправлено службою ${messages[0]} ,\n номер відправлення ${messages[1]}📦`);
            __2.bot.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: inlineKeyboard,
                },
            });
            console.log('done confirmation');
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.SM_sendOrderConfirmation = SM_sendOrderConfirmation;
//# sourceMappingURL=sendingMesagesFuncs.js.map