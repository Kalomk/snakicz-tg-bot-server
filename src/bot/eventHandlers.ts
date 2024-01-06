import TelegramBot from 'node-telegram-bot-api';
import { webAppUrl } from '../..';
import { bot } from '../..';
import {
  SM_actualizeInfo,
  SM_confrimOrder,
  SM_paymentConfirm,
  SM_requestUserPhoto,
  SM_sendOrderConfirmation,
  SM_sendPaymentMessage,
  SM_userAcceptOrder,
  SM_userDeclineOrder,
} from './sendingMesagesFuncs';
import { createOrFindExistUserService } from '../services/userService';
import { UT_sendKeyboardMessage } from '@/utils';

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

  await createOrFindExistUserService({ uniqueId: chatId.toString(), phoneNumber }).then((user) => {
    const isFirstTimeBuy = user?.isFirstTimeBuy;

    const webUrl = isFirstTimeBuy ? webAppUrl + '/priceSelect' : webAppUrl;
    const thankYouMessage = "Дякуємо за контакти. Для продовження натисніть 'Магазин'";

    // UT_sendKeyboardMessage(bot, chatId, thankYouMessage, storeKeyboard);
    if (isFirstTimeBuy) {
      bot.sendMessage(chatId, thankYouMessage, {
        reply_markup: {
          inline_keyboard: [[{ text: 'Магазин', web_app: { url: webUrl } }]],
        },
      });
    } else {
      bot.sendMessage(chatId, 'Чи бажаєте повторити замовлення?', {
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
      SM_confrimOrder({ text, chatId, userId, messageId, keyboards });
      break;
    case 'privat':
      SM_sendPaymentMessage(chatId!, action.confirm);
      break;
    case 'polish_bank':
      SM_sendPaymentMessage(chatId!, action.confirm);
      break;
    case 'pay-confirm':
      SM_paymentConfirm({ text, chatId, userId, messageId, keyboards });
      break;
    case 'send-pack-number':
      SM_sendOrderConfirmation({
        text,
        chatId,
        userId,
        messageId,
        keyboards,
        orderNumberFromText: orderNumberFromText!,
      });
      break;
    case 'sendPhoto':
      SM_requestUserPhoto(chatId!);
      break;
    case 'actualize':
      SM_actualizeInfo({
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
