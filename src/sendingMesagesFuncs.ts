import TelegramBot from 'node-telegram-bot-api';
import { group_chat, group_chat_for_payment } from '..';

interface SendingMessageTypes {
  bot: TelegramBot;
  chatId: number;
  userId: number;
  text: string;
  messageId: number;
  keyboards: TelegramBot.InlineKeyboardButton[][];
}

type SendingMessageTypeWithOrderNuymber = SendingMessageTypes & { orderNumberFromText: string };

export function SM_confrimOrder({
  bot,
  chatId,
  userId,
  text,
  messageId,
  keyboards,
}: SendingMessageTypes) {
  // Create a new array with the first element replaced
  const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
  updatedKeyboards[0] = [
    {
      text: 'Підтверженно!!!',
      callback_data: 'payment_confirmation',
    },
  ];

  const inlineKeyboard = [...updatedKeyboards];

  const paymentButtons: TelegramBot.EditMessageTextOptions = {
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

  bot.sendMessage(
    userId,
    'Ваше замовлення підтверджено ✅ \n \nБудь ласка, оберіть зручний для Вас спосіб оплати: ',
    paymentButtons
  );
}

export function SM_sendPaymentMessage(bot: TelegramBot, chatId: number, type: string) {
  function checkType(type: string) {
    switch (type) {
      case 'privat':
        return 'Номер картки: 5363542019838953\nПІБ отримувача: Демементьєва Анастасія\nКурс: 8.8\nСума: сума в злотих помножена на 8.8';
      case 'polish_bank':
        return 'Номер рахунку:\n61160014621804889540000001\nПІБ отримувача: Roman Lehchonok\nБанк отримувача: BNP Paribas';
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

export function SM_requestUserPhoto(
  bot: TelegramBot,
  chat_id: number,
  orderNumber: { [key: string]: string }
) {
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

        await bot.sendPhoto(group_chat_for_payment, photo.file_id);
        bot.sendMessage(group_chat_for_payment, `Скрін підтвердження №${orderNumber[chatId]}`);
        bot.sendMessage(chatId, 'Фото підтвердження оплати відправлено 😍\nЧекайте на відправку');
        delete orderNumber[chatId];
      } catch (error) {
        console.error('Error sending photo:', error);
        bot.sendMessage(chatId, 'Під час відправлення фото сталася помилка 😳\nСпробуйте знову');
        SM_requestUserPhoto(bot, chatId, orderNumber);
      }
    } else {
      bot.sendMessage(chatId, 'Повідомлення не містить фото підтвердження оплати');
      SM_requestUserPhoto(bot, chatId, orderNumber);
    }
  });
}

export function SM_paymentConfirm({
  bot,
  chatId,
  userId,
  text,
  messageId,
  keyboards,
}: SendingMessageTypes) {
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

export function SM_userDeclineOrder({
  bot,
  chatId,
  group_id,
  messageId_group,
  messageId,
  orderNumberFromText,
}: {
  bot: TelegramBot;
  chatId: number;
  group_id: string;
  messageId_group: number;
  messageId: number;
  orderNumberFromText: string;
}) {
  bot.editMessageText('Ваше замовлення було аннульоване!', {
    chat_id: chatId,
    message_id: messageId,
  });

  bot.editMessageText(`Замовлення ${orderNumberFromText} відхилено`, {
    chat_id: group_id,
    message_id: messageId_group,
  });
}

export function SM_userAcceptOrder(bot: TelegramBot, groupId:string, orderNumberFromText: string) {
  bot.sendMessage(groupId, `Замовлення ${orderNumberFromText} продовжено`);
}

export function SM_actualizeInfo({
  bot,
  chatId,
  keyboards,
  userId,
  messageId,
  text,
  orderNumberFromText,
}: SendingMessageTypeWithOrderNuymber) {
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

  const inlineKeyboardUser: TelegramBot.SendMessageOptions = {
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

  bot.sendMessage(
    userId,
    `Чи ваше замовлення ( Номер замовлення: ${orderNumberFromText} ) ще актуально?`,
    inlineKeyboardUser
  );
}

export function SM_sendOrderConfirmation({
  bot,
  chatId,
  keyboards,
  userId,
  messageId,
  text,
  orderNumberFromText,
}: SendingMessageTypeWithOrderNuymber) {
  // Create a new array with the first element replaced
  const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
  updatedKeyboards[2] = [
    {
      text: 'Інформацію о посилці вислано (Знову вислати)!!!',
      callback_data: 'send-pack-number',
    },
  ];
  const inlineKeyboard = [...updatedKeyboards];

  bot.sendMessage(
    group_chat,
    `Надішліть інформацію про доставку посилки № ${orderNumberFromText}  через SPACE: 1) служба доставки 2) номер посилки`
  );
  bot.once('message', async (msg) => {
    const textFromMsg = msg?.text;
    try {
      const messages = textFromMsg!.split(' ');

      bot.sendMessage(
        userId,
        `Ваше замовлення № ${orderNumberFromText} відправлено службою ${messages[0]} ,\n номер відправлення ${messages[1]}📦`
      );

      bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
      console.log('done confirmation');
    } catch (err) {
      console.log(err);
    }
  });
}

export function SM_onCallbackQuery(
  bot: TelegramBot,
  callbackQuery: TelegramBot.CallbackQuery,
  orderNumber: { [key: string]: string },
  group_id: string
) {
  const action = JSON.parse(callbackQuery.data!);
  const text = callbackQuery?.message?.text!;
  const chatId = callbackQuery?.message?.chat.id!;
  const messageId = callbackQuery?.message?.message_id!;
  const keyboards = callbackQuery?.message?.reply_markup?.inline_keyboard!;
  const userId = action?.chat_id!;
  const messageIdGroup = action?.message_id!;

  let orderNumberFromText;
  const orderNumberMatch = text?.match(/Номер замовлення:\s+(\d+)/);

  if (orderNumberMatch && orderNumberMatch[1]) {
    // Extracted order number
    orderNumberFromText = orderNumberMatch[1];
    console.log(`Order Number: ${orderNumberFromText}`);
  } else {
    console.log('Order number not found in the text.');
  }

  switch (action.confirm) {
    case 'confirm':
      SM_confrimOrder({ bot, text, chatId, userId, messageId, keyboards });
      break;
    case 'privat':
      SM_sendPaymentMessage(bot, chatId!, action.confirm);
      break;
    case 'polish_bank':
      SM_sendPaymentMessage(bot, chatId!, action.confirm);
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
        orderNumberFromText: orderNumberFromText!,
      });
      break;
    case 'sendPhoto':
      SM_requestUserPhoto(bot, chatId!, orderNumber);
      break;
    case 'actualize':
      SM_actualizeInfo({
        bot,
        text,
        chatId,
        keyboards,
        userId,
        messageId,
        orderNumberFromText: orderNumberFromText!,
      });
      break;
    case 'accept':
      SM_userAcceptOrder(bot, group_id, orderNumberFromText!);
      break;
    case 'decline':
      SM_userDeclineOrder({
        bot,
        chatId,
        group_id,
        messageId_group: messageIdGroup,
        messageId,
        orderNumberFromText: orderNumberFromText!,
      });
      break;
  }
}
