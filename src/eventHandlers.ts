import TelegramBot from 'node-telegram-bot-api';
import { group_chat, prisma, webAppUrl } from '..';
import { UT_sendKeyboardMessage } from './utils';
import { createOrFindExistUser, createOrder } from './controllers/controller';
import { bot } from '..';
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

export async function EH_webDataHandler(msg: TelegramBot.Message) {
  if (msg.web_app_data?.data) {
    const chatId = msg.chat.id;
    const userName = msg.chat.username;
    // Find the user by chatId
    const user = await prisma.user.findUnique({
      where: { chatId: chatId.toString() },
    });

    if (user) {
      const userOrderCount = user?.ordersCount;
      const userPhoneNumber = user?.phoneNumber;
      const orderNumber = chatId + Math.floor(Math.random() * 9000) + 1000;
      const isFirstTimeBuy = user.isFirstTimeBuy;

      const inlineKeyboard = [
        [
          {
            text: 'Почати знову',
          },
        ],
      ];

      const option = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Надіслати підтверждення',
                callback_data: JSON.stringify({ confirm: 'confirm', chat_id: chatId }),
              },
            ],
            [
              {
                text: 'Підтвердити оплату',
                callback_data: JSON.stringify({ confirm: 'pay-confirm', chat_id: chatId }),
              },
            ],
            [
              {
                text: 'Вислати номер пачки',
                callback_data: JSON.stringify({ confirm: 'send-pack-number', chat_id: chatId }),
              },
            ],
            [
              {
                text: 'Актуалізувати користувача',
                callback_data: JSON.stringify({ confirm: 'actualize', chat_id: chatId }),
              },
            ],
          ],
        },
      };

      UT_sendKeyboardMessage(bot, chatId, 'Замовлення відправлено', inlineKeyboard);

      try {
        const dataFromResponse = JSON.parse(msg.web_app_data.data);
        const {
          data,
          products,
          totalPrice,
          totalWeight,
          freeDelivery,
          isCatExist,
          activePrice,
          rightShipPrice,
          rightCurrentCountry,
        } = dataFromResponse;
        const calcTotalPrice = +totalPrice + Number(rightShipPrice);
        // Functions to format messages
        function formatProduct(count: number, title: string, weight: number) {
          return `назва: ${title} вага: ${weight} кількість: ${count},\n`;
        }

        const userNameAndLastName = `${data?.userName} ${data?.userLastName}`;
        const addressPack = data?.addressPack || 'нема';
        const firstTimeBuyText = isFirstTimeBuy ? 'так' : 'ні';
        const userOrderCountText = !isFirstTimeBuy
          ? `Кількість замовлень за весь час: ${userOrderCount}`
          : '';
        const userAddress = data?.userAddress || 'нема';
        const country = rightCurrentCountry;
        const userCity = data?.userCity;
        const userIndexCity = data?.userIndexCity;
        const userNickname = `@${userName}`;
        const catStatus = isCatExist ? 'Є котик' : 'Нема котика';
        const orderNumberText = orderNumber;
        const freeDeliveryStatus = freeDelivery ? 'Є безкоштовна доставка' : 'Нема';
        const totalPriceText = `${calcTotalPrice} ${activePrice}`;
        const phoneForShipping = data?.phoneNumber;
        const contactPhoneNumber = userPhoneNumber;
        const email = data?.email;
        const orderWeight = totalWeight;

        const productsList = products
          .map((item: any) => formatProduct(item.count, item.title, item.weight))
          .join('\n\n');

        async function sendProducts() {
          const prodMessage = `
  Ім'я та Прізвище: ${userNameAndLastName}
  Адреса-Пачкомату: ${addressPack},
  Купує вперше: ${firstTimeBuyText},
  ${userOrderCountText}
  Адреса-покупця: ${userAddress},
  Країна: ${country}
  Місто: ${userCity},
  Індекс: ${userIndexCity}
  Нік: ${userNickname},
  Є котик: ${catStatus}
  Номер замовлення: ${orderNumberText}
  Безкоштовна доставка: ${freeDeliveryStatus}
  Cума замовлення: ${totalPriceText}
  Номер телефону для відправки: ${phoneForShipping}
  Номер телефону для контакту: ${contactPhoneNumber}
  Емейл: ${email}
  Вага замовлення: ${orderWeight}
  Позиції: \n\n${productsList}`;

          await bot.sendMessage(group_chat, prodMessage, option);
        }
        async function sendMessages() {
          const messagesToSend = [
            `Ваша адреса: ${userAddress || addressPack}`,
            `Cума замовлення: ${calcTotalPrice} ${activePrice}`,
            `Вага замовлення: ${totalWeight} грам`,
            `Номер замовлення: ${orderNumber}`,
          ];

          for (const message of messagesToSend) {
            await bot.sendMessage(chatId, message);
          }

          setTimeout(async () => {
            await bot.sendMessage(
              chatId,
              'Дякуємо за замовлення ❤️\nБудь ласка, очікуйте підтвердження і реквізити на оплату\nЯкщо у вас виникли питання - Ви можете звернутись до нашого менеджера у телеграм (https://t.me/snakicz_manager) або (https://www.instagram.com/snakicz/)'
            );
          }, 2000);
        }
        createOrder({
          chatId: chatId,
          orderData: {
            orderNumber: JSON.stringify(orderNumber),
            contactPhoneNumber: userPhoneNumber,
            phoneNumber: data?.phoneNumber,
            userNickname,
            userAddress,
            userCity,
            userIndexCity,
            userLastName: data?.userLastName,
            userName: data?.userName,
            isCatExist,
            addressPack,
            freeDelivery,
            activePrice,
            totalPrice,
            email,
            totalWeight,
            orderItems: JSON.stringify(products),
          },
        });

        sendMessages();
        sendProducts();

        // Update the user's values
        await prisma.user.update({
          where: { chatId: user.chatId },
          data: {
            ordersCount: user.ordersCount + 1, // Increment ordersCount by 1
            isFirstTimeBuy: false, // Set isFirstTimeBuy to false
          },
        });
      } catch (e) {
        console.error('Error parsing data:', e);
      }
    }
  }
}

export async function EH_contactHandler(msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  // Generate a random number between 1000 and 9999
  const phoneNumber = msg?.contact?.phone_number!;

  await createOrFindExistUser({ chatId: chatId, phoneNumber }).then((user) => {
    const isFirstTimeBuy = user?.isFirstTimeBuy;

    const storeKeyboard = [[{ text: 'Магазин', web_app: { url: webAppUrl } }]];
    const thankYouMessage = "Дякуємо за контакти. Для продовження натисніть 'Магазин'";

    UT_sendKeyboardMessage(bot, chatId, thankYouMessage, storeKeyboard);

    // bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
    //     reply_markup: {
    //         inline_keyboard: [
    //             [{text: 'Повторити замовлення', web_app: {url: webAppUrl + "/prevOrders"}}]
    //         ]
    //     }
    // })
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
