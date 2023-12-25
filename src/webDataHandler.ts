import { group_chat, prisma, bot } from '..';
import { UT_sendKeyboardMessage } from './utils';
import { Orders } from './services';

export async function webDataHandler(requestedData: FormData) {
  const { chatId, userFromWeb, ...dataFromResponse } = requestedData;

  // Find the user by chatId
  const user = await prisma.user.findUnique({
    where: { uniqueId: chatId.toString() },
  });

  if (user) {
    const userPhoneNumber = user?.phoneNumber;
    const orderNumber = chatId + Math.floor(Math.random() * 9000) + 1000;

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

      const addressPack = data?.addressPack || 'нема';
      const userAddress = data?.userAddress || 'нема';
      const country = rightCurrentCountry;
      const userCity = data?.userCity;
      const userIndexCity = data?.userIndexCity;
      const userNickname = userFromWeb;
      const email = data?.email;

      async function sendMessages() {
        const messagesToSend: any[] = [
          (data?.addressPack && `Адреса пачкомату:${data?.addressPack}`) ||
            (data?.userAddress && `Ваша адреса: ${data?.userAddress}`),
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
      Orders.createOrder({
        uniqueId: chatId,
        orderData: {
          orderNumber: JSON.stringify(orderNumber),
          contactPhoneNumber: userPhoneNumber,
          phoneNumber: data?.phoneNumber,
          userNickname,
          userAddress,
          userCountry: country,
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
          price: calcTotalPrice,
          totalWeight,
          orderItems: JSON.stringify(products),
        },
      });

      sendMessages();

      // Update the user's values
      await prisma.user.update({
        where: { uniqueId: user.uniqueId },
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
