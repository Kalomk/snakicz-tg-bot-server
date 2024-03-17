import TelegramBot from 'node-telegram-bot-api';
import { group_chat_for_payment, _token, destinationUrl, prisma } from '../..';
import { bot } from '../..';
import { getLastDataService } from '../services/orderService';
import { uploadAndDeleteFile } from '@/utils';

interface SendingMessageTypes {
  chatId: number;
  userId: number;
  messageId?: string;
  messages?: string[];
}

type SendingMessageTypeWithOrderNuymber = SendingMessageTypes & { orderNumber: string };

export function SM_confrimOrder({ chatId }: Omit<SendingMessageTypes, 'userId'>) {
  const paymentButtons: TelegramBot.EditMessageTextOptions = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'А-банк (курс 9)',
            callback_data: JSON.stringify({ confirm: 'ukr-bank' }),
          },
        ],
        [
          {
            text: 'Переказ на польський рахунок',
            callback_data: JSON.stringify({ confirm: 'polish_bank' }),
          },
        ],
      ],
    },
  };

  bot.sendMessage(
    chatId,
    'Ваше замовлення підтверджено ✅ \n \nБудь ласка, оберіть зручний для Вас спосіб оплати: ',
    paymentButtons
  );
}

export function SM_sendPaymentMessage(chatId: number, type: string) {
  function checkType(type: string) {
    switch (type) {
      case 'ukr-bank':
        return 'Номер картки: 4323357029261688\nПІБ отримувача: Демементьєва Анастасія\nКурс: 9\nСума: сума в злотих помножена на 9';
      case 'polish_bank':
        return 'Номер рахунку:\n18160014621731022840000001\nOтримувач: Snakicz\nБанк отримувача: BNP Paribas Tytuł: oplata zamówienia';
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

export function SM_requestUserPhoto(chat_id: number) {
  bot.sendMessage(chat_id, 'Вишліть фотопідтвердження оплати,прикріпивши фото знизу 👇');
  // Listen for messages from the user
  bot.once('photo', async (msg) => {
    const chatId = msg.chat.id;
    const orderNumber = await getLastDataService(chatId.toString()).then(
      (order) => order?.orderNumber
    );

    if (msg.photo && msg.photo.length > 0) {
      // The `msg.photo` property is an array of photo sizes
      // You can access different sizes using indexes (0 - smallest, 2 - largest)
      const photo = msg.photo[msg.photo.length - 1];
      try {
        // Send the photo to the group chat

        const photoFile = await bot.getFile(photo.file_id);

        //get pic url
        const URL_PIC = `https://api.telegram.org/file/bot${_token}/${photoFile.file_path}`;
        //send paymentConfirmation to order
        const imgUrl = await uploadAndDeleteFile(URL_PIC, destinationUrl);

        //update order payment pic url
        await prisma.order.update({
          where: { uniqueId: chat_id },
          data: { paymentConfirmPicUrl: imgUrl },
        });

        await bot.sendPhoto(group_chat_for_payment, photo.file_id);
        bot.sendMessage(group_chat_for_payment, `Скрін підтвердження №${orderNumber}`);
        bot.sendMessage(chatId, 'Фото підтвердження оплати відправлено 😍\nЧекайте на відправку');
      } catch (error) {
        console.error('Error sending photo:', error);
        bot.sendMessage(chatId, 'Під час відправлення фото сталася помилка 😳\nСпробуйте знову');
        SM_requestUserPhoto(chatId);
      }
    } else {
      bot.sendMessage(chatId, 'Повідомлення не містить фото підтвердження оплати');
      SM_requestUserPhoto(chatId);
    }
  });
}

export function SM_paymentConfirm(userId: string) {
  bot.sendMessage(userId, 'Вашу оплату підтверджено✅\nБудь ласка, очікуйте номер відправлення 📦');
}

export function SM_userDeclineOrder({
  chatId,
  group_id,
  messageId,
  orderNumber,
}: {
  bot: TelegramBot;
  chatId: number;
  group_id: string;
  messageId: number;
  orderNumber: string;
}) {
  bot.editMessageText('Ваше замовлення було аннульоване!', {
    chat_id: chatId,
    message_id: messageId,
  });

  bot.sendMessage(group_id, `Замовлення ${orderNumber} відхилено`);
}

export function SM_userAcceptOrder({
  chatId,
  group_id,
  messageId,
  orderNumber,
}: {
  bot: TelegramBot;
  chatId: number;
  group_id: string;
  messageId: number;
  orderNumber: string;
}) {
  bot.sendMessage(group_id, `Замовлення ${orderNumber} продовжено`);
  bot.editMessageText('Ваше замовлення продовжено!', {
    chat_id: chatId,
    message_id: messageId,
  });
}

export function SM_actualizeInfo(userId: string, orderNumber: string) {
  const inlineKeyboardUser: TelegramBot.SendMessageOptions = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Так',
            callback_data: JSON.stringify({ confirm: 'accept' }),
          },
        ],
        [
          {
            text: 'Ні',
            callback_data: JSON.stringify({ confirm: 'decline' }),
          },
        ],
      ],
    },
  };

  bot.sendMessage(
    userId,
    `Чи ваше замовлення ( Номер замовлення: ${orderNumber} ) ще актуально?`,
    inlineKeyboardUser
  );
}

export function SM_sendOrderConfirmation({
  userId,
  orderNumber,
  messages,
}: Omit<SendingMessageTypeWithOrderNuymber, 'chatId'>) {
  bot.sendMessage(
    userId,
    `Ваше замовлення № ${orderNumber} відправлено службою ${messages![0]} ,\n номер відправлення ${
      messages![1]
    }📦`
  );
}
