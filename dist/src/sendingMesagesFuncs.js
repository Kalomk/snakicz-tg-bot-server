"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SM_onCallbackQuery = exports.SM_sendOrderConfirmation = exports.SM_actualizeInfo = exports.SM_userAcceptOrder = exports.SM_userDeclineOrder = exports.SM_paymentConfirm = exports.SM_requestUserPhoto = exports.SM_sendPaymentMessage = exports.SM_confrimOrder = void 0;
const __1 = require("..");
function SM_confrimOrder({ bot, chatId, userId, text, messageId, keyboards, }) {
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
                        text: 'ПриватБанк (курс 8.8)',
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
    bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    });
    bot.sendMessage(userId, 'Ваше замовлення підтверджено ✅ \n \nБудь ласка, оберіть зручний для Вас спосіб оплати: ', paymentButtons);
}
exports.SM_confrimOrder = SM_confrimOrder;
function SM_sendPaymentMessage(bot, chatId, type) {
    function checkType(type) {
        switch (type) {
            case 'privat':
                return 'Номер картки: 5363542019838953\nПІБ отримувача: Демементьєва Анастасія\nКурс: 8.8\nСума: сума в злотих помножена на 8.8';
            case 'polish_bank':
                return 'Номер рахунку:\n24 1600 1462 1731 7466 5000 0001\nПІБ отримувача: Dementieva Anastasiia\nБанк отримувача: PNB Paribas';
        }
    }
    bot.sendMessage(chatId, `${checkType(type)}`, {
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
function SM_requestUserPhoto(bot, chat_id, orderNumber) {
    bot.sendMessage(chat_id, 'Вишліть фотопідтвердження оплати,прикріпивши фото знизу 👇');
    // Listen for messages from the user
    bot.once('photo', async (msg) => {
        const chatId = msg.chat.id;
        if (msg.photo && msg.photo.length > 0) {
            // The `msg.photo` property is an array of photo sizes
            // You can access different sizes using indexes (0 - smallest, 2 - largest)
            const photo = msg.photo[msg.photo.length - 1]; // Use the largest available photo
            try {
                // Send the photo to the group chat
                await bot.sendPhoto(__1.group_chat_for_payment, photo.file_id);
                bot.sendMessage(__1.group_chat_for_payment, `Скрін підтвердження №${orderNumber[chatId]}`);
                bot.sendMessage(chatId, 'Фото підтвердження оплати відправлено 😍\nЧекайте на відправку');
                delete orderNumber[chatId];
            }
            catch (error) {
                console.error('Error sending photo:', error);
                bot.sendMessage(chatId, 'Під час відправлення фото сталася помилка 😳\nСпробуйте знову');
                SM_requestUserPhoto(bot, chatId, orderNumber);
            }
        }
        else {
            bot.sendMessage(chatId, 'Повідомлення не містить фото підтвердження оплати');
            SM_requestUserPhoto(bot, chatId, orderNumber);
        }
    });
}
exports.SM_requestUserPhoto = SM_requestUserPhoto;
function SM_paymentConfirm({ bot, chatId, userId, text, messageId, keyboards, }) {
    // Create a new array with the first element replaced
    const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
    updatedKeyboards[1] = [
        {
            text: 'Оплату підтверджено!!!',
            callback_data: 'payment_confirmation',
        },
    ];
    const inlineKeyboard = [...updatedKeyboards];
    bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    });
    bot.sendMessage(userId, 'Вашу оплату підтверджено✅\nБудь ласка, очікуйте номер відправлення 📦');
}
exports.SM_paymentConfirm = SM_paymentConfirm;
function SM_userDeclineOrder(bot, chatId, userId, messageId, orderNumberFromText) {
    bot.editMessageText('Ваше замовлення було аннульоване!', {
        chat_id: chatId,
        message_id: messageId,
    });
    bot.sendMessage(userId, `Замовлення ${orderNumberFromText} відхилено`);
}
exports.SM_userDeclineOrder = SM_userDeclineOrder;
function SM_userAcceptOrder(bot, userId, orderNumberFromText) {
    bot.sendMessage(userId, `Замовлення ${orderNumberFromText} продовжено`);
}
exports.SM_userAcceptOrder = SM_userAcceptOrder;
function SM_actualizeInfo({ bot, chatId, keyboards, userId, messageId, text, orderNumberFromText, }) {
    const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
    updatedKeyboards[3] = [
        {
            text: 'Запит вислано (Натисніть знову щоб вислати запит знову)',
            callback_data: 'actualize',
        },
    ];
    const inlineKeyboard = [...updatedKeyboards];
    bot.editMessageText(text, {
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
                        callback_data: JSON.stringify({ confirm: 'accept', chat_id: chatId }),
                    },
                ],
                [
                    {
                        text: 'Ні',
                        callback_data: JSON.stringify({ confirm: 'decline', chat_id: chatId }),
                    },
                ],
            ],
        },
    };
    bot.sendMessage(userId, `Чи ваше замовлення ( Номер замовлення: ${orderNumberFromText} ) ще актуально?`, inlineKeyboardUser);
}
exports.SM_actualizeInfo = SM_actualizeInfo;
function SM_sendOrderConfirmation({ bot, chatId, keyboards, userId, messageId, text, orderNumberFromText, }) {
    // Create a new array with the first element replaced
    const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
    updatedKeyboards[2] = [
        {
            text: 'Оплату підтверджено!!!',
            callback_data: 'payment_confirmation',
        },
    ];
    const inlineKeyboard = [...updatedKeyboards];
    bot.sendMessage(__1.group_chat, `Надішліть інформацію про доставку посилки № ${orderNumberFromText}  через SPACE: 1) служба доставки 2) номер посилки`);
    bot.once('message', async (msg) => {
        const textFromMsg = msg?.text;
        try {
            const messages = textFromMsg.split(' ');
            bot.sendMessage(userId, `Ваше замовлення № ${orderNumberFromText} відправлено службою ${messages[0]} ,\n номер відправлення ${messages[1]}📦`);
            bot.editMessageText(text, {
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
function SM_onCallbackQuery(bot, callbackQuery, orderNumber) {
    const action = JSON.parse(callbackQuery.data);
    const text = callbackQuery?.message?.text;
    const chatId = callbackQuery?.message?.chat.id;
    const messageId = callbackQuery?.message?.message_id;
    const keyboards = callbackQuery?.message?.reply_markup?.inline_keyboard;
    const userId = action?.chat_id;
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
            SM_confrimOrder({ bot, text, chatId, userId, messageId, keyboards });
            break;
        case 'privat':
            SM_sendPaymentMessage(bot, chatId, action.confirm);
            break;
        case 'polish_bank':
            SM_sendPaymentMessage(bot, chatId, action.confirm);
            break;
        case 'pay-confirm':
            SM_paymentConfirm({ bot, text, chatId, userId, messageId, keyboards });
            break;
        case 'send-pack-number':
            SM_sendOrderConfirmation({
                bot,
                text,
                chatId,
                userId,
                messageId,
                keyboards,
                orderNumberFromText: orderNumberFromText,
            });
            break;
        case 'sendPhoto':
            SM_requestUserPhoto(bot, chatId, orderNumber);
            break;
        case 'actualize':
            SM_actualizeInfo({
                bot,
                text,
                chatId,
                keyboards,
                userId,
                messageId,
                orderNumberFromText: orderNumberFromText,
            });
            break;
        case 'accept':
            SM_userAcceptOrder(bot, userId, orderNumberFromText);
            break;
        case 'decline':
            SM_userDeclineOrder(bot, chatId, userId, messageId, orderNumberFromText);
            break;
    }
}
exports.SM_onCallbackQuery = SM_onCallbackQuery;
//# sourceMappingURL=sendingMesagesFuncs.js.map