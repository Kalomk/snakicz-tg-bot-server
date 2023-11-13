import TelegramBot from 'node-telegram-bot-api';
import { group_chat, webAppUrl } from '..';
import { UT_sendKeyboardMessage } from './utils';

export function EH_webDataHandler(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  orderNumber: { [key: string]: string },
  userPhoneNumber: { [key: string]: string },
  userFirstTimeClick: { [key: string]: boolean }
) {
  if (msg.web_app_data?.data) {
    const chatId = msg.chat.id;
    const user = msg.chat.username;

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

      async function sendProducts() {
        const prodMessage = `
        Ім'я та Прізвище: ${data?.userName} ${data?.userLastName}
        Адреса-Пачкомату: ${data?.addressPack || 'нема'},
        Адреса-покупця: ${data?.userAddress || 'нема'},
        Країна: ${rightCurrentCountry}
        Місто: ${data?.userCity},
        Індекс: ${data?.userIndexCity}
        Нік: @${user},
        Є котик: ${isCatExist ? 'Є котик' : 'Нема котика'} 
        Номер замовлення: ${orderNumber[chatId]}
        Безкоштовна доставка: ${freeDelivery ? 'Є безкоштовна доставка' : 'Нема'}
        Cума замовлення: ${calcTotalPrice} ${activePrice},
        Номер телефону для відправки: ${data?.phoneNumber},
        Номер телефону для контакту: ${userPhoneNumber[chatId]}
        Емейл: ${data?.email},
        Вага замовлення: ${totalWeight},
        Позиції: \n\n${products
          .map((item: any) => formatProduct(item.count, item.title, item.weight))
          .join('\n\n')}`;

        await bot.sendMessage(group_chat, prodMessage, option);
      }

      async function sendMessages() {
        const messagesToSend = [
          `Ваша адреса: ${data?.userAddress || data?.addressPack}`,
          `Cума замовлення: ${calcTotalPrice} ${activePrice}`,
          `Вага замовлення: ${totalWeight} грам`,
          `Номер замовлення: ${orderNumber[chatId]}`,
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

      sendMessages();
      sendProducts();

      delete userPhoneNumber[chatId];
      userFirstTimeClick[chatId] = true;
    } catch (e) {
      console.error('Error parsing data:', e);
    }
  }
}

export function EH_contactHandler(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userPhoneNumber: { [key: string]: string },
  orderNumber: { [key: string]: string },
  userFirstTimeClick: { [key: string]: boolean }
) {
  const chatId = msg.chat.id;
  // Generate a random number between 1000 and 9999
  const randomPart = Math.floor(Math.random() * 9000) + 1000;

  userPhoneNumber[chatId] = msg?.contact?.phone_number!;
  // Combine chatId and the random number to create the order number
  orderNumber[chatId] = `${chatId}${randomPart}`;

  const url = !userFirstTimeClick[chatId] ? webAppUrl + '/priceSelect' : webAppUrl;

  const storeKeyboard = [[{ text: 'Магазин', web_app: { url } }]];
  const thankYouMessage = "Дякуємо за контакти. Для продовження натисніть 'Магазин'";
  UT_sendKeyboardMessage(bot, chatId, thankYouMessage, storeKeyboard);
}
