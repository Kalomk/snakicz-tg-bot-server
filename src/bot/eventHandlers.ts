import TelegramBot from 'node-telegram-bot-api';
import { webAppUrl } from '../..';
import { bot } from '../..';
import {
  SM_requestUserAudio,
  SM_requestUserPhoto,
  SM_sendPaymentMessage,
  SM_userAcceptOrder,
  SM_userDeclineOrder,
} from './sendingMesagesFuncs';
import { createOrFindExistUserService } from '../services/userService';
import { UT_sendKeyboardMessage } from '../utils';

// Function to handle the /start command
export function EH_handleStartCommand(msg: TelegramBot.Message) {
  bot.removeListener('contact', EH_contactHandler);

  const chatId = msg.chat.id;

  const startMessage =
    'Вас вітає чат-бот Snakicz 🐟\nДля оформления замовлення, будь ласка, поділіться своїм номером телефону 👇🏻\nВи також можете оформити замовлення у нашого менеджера в [телеграм](https://t.me/snakicz_manager) або [інстаграм](https://www.instagram.com/snakicz/)';
  const contactKeyboard = [[{ text: 'Мій телефон', request_contact: true }], ['Вийти']];

  UT_sendKeyboardMessage(bot, chatId, startMessage, contactKeyboard);

  bot.once('contact', EH_contactHandler);
}

export async function EH_contactHandler(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  // Generate a random number between 1000 and 9999
  const phoneNumber = msg?.contact?.phone_number!;
  const updatedKeyboard = [['Почати знову']];

  await createOrFindExistUserService({ uniqueId: chatId.toString(), phoneNumber }).then((user) => {
    const isFirstTimeBuy = user && user.ordersCount <= 1;

    const webUrl = isFirstTimeBuy ? webAppUrl + '/priceSelect' : webAppUrl;
    const thankYouMessage = "Дякуємо за контакти. Для продовження натисніть 'Магазин'";
    const repeatMessage = "Щоб вислати номер ще раз,натисніть 'Почати знову'";

    UT_sendKeyboardMessage(bot, chatId, repeatMessage, updatedKeyboard);

    if (isFirstTimeBuy) {
      bot.sendMessage(chatId, thankYouMessage, {
        reply_markup: {
          inline_keyboard: [[{ text: 'Магазин', web_app: { url: webUrl } }]],
        },
      });
    } else {
      bot.sendMessage(chatId, 'Чи бажаєте повторити попереднє замовлення?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Ні', web_app: { url: webUrl } }],
            [{ text: 'Так', web_app: { url: webAppUrl + '/prevOrders' } }],
          ],
        },
      });
    }
  });
}

export async function EH_onCallbackQuery(
  callbackQuery: TelegramBot.CallbackQuery,
  group_id: string
) {
  const action = JSON.parse(callbackQuery.data!);
  const text = callbackQuery?.message?.text!;
  const chatId = callbackQuery?.message?.chat.id!;
  const messageId = callbackQuery?.message?.message_id!;

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
    case 'ukr-bank':
      SM_sendPaymentMessage(chatId!, action.confirm);
      break;
    case 'polish_bank':
      SM_sendPaymentMessage(chatId!, action.confirm);
      break;
    case 'sendPhoto':
      SM_requestUserPhoto(chatId!);
      break;
    case 'sendAudio':
      SM_requestUserAudio(chatId);
    case 'accept':
      SM_userAcceptOrder({
        bot,
        chatId,
        group_id,
        messageId,
        orderNumber: orderNumberFromText!,
      });
      break;
    case 'decline':
      SM_userDeclineOrder({
        bot,
        chatId,
        group_id,
        messageId,
        orderNumber: orderNumberFromText!,
      });
      break;
  }
}
