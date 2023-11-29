import { group_chat, prisma, bot } from '..';
import { UT_sendKeyboardMessage } from './utils';
import { createOrder } from './controllers/controller';

export interface UserDataTypes {
  userName: string;
  userLastName: string;
  phoneNumber: string;
  email: string;
  userIndexCity: string;
  addressPack?: string;
  userCity: string;
  userAddress?: string;
  catPic: undefined | string;
}

export type CartItem = {
  title: string;
  imageUrl: string;
  price: number;
  weight: number;
  id: string | string;
  count: number;
  activePrice: 'zł' | '€';
  activeCountry: string;
};

interface FormData {
  data: UserDataTypes;
  totalPrice: number;
  totalWeight: number;
  activePrice: string;
  rightCurrentCountry: string;
  rightShipPrice: number;
  isCatExist: boolean;
  freeDelivery: boolean;
  products: CartItem[]; // Assuming OrderItem is another type/interface
  userFromWeb: string; // Assuming UserType is another type/interface
  chatId: number;
}

export async function webDataHandler(requestedData: FormData) {
  const { chatId, userFromWeb, ...dataFromResponse } = requestedData;

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
      const userNickname = `@${userFromWeb}`;
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
        // if (data.catPic) {
        //   const form = new FormData();
        //   form.append('chat_id', '-1001820916737'); // Replace with your chat ID
        //   form.append('photo', data.catPic);
        //   fetch(
        //     `https://api.telegram.org/bot6478934801:AAEAhngq9JoXrGjHlYJQzSgPW_5AEZHwQI4/sendPhoto`,
        //     { method: 'POST', body: form }
        //   )
        //     .then((res: any) => res.json())
        //     .then((response: any) => {
        //       console.log(response);
        //     })
        //     .catch((error: any) => {
        //       console.log(error);
        //     });
        // }
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
  } else {
    throw new Error('User dosent found');
  }
}
