import { uploadFileToMediaServer } from '../utils';
import { group_chat, prisma, bot } from '../..';
import { FormData, OrderType, ActualPriceType } from '../../types';
import { createOrderService } from '../services/orderService';
import {
  changeQuantityOfProductsService,
  checkEnableProductsService,
} from '../services/productService';

export async function webDataHandler(requestedData: FormData) {
  const { chatId, userFromWeb, products, catPic, ...dataFromResponse } = requestedData;

  //send user messages
  const sendMessages = async ({
    data,
    totalPrice,
    activePrice,
    totalWeight,
    orderNumber,
  }: Partial<FormData>) => {
    const parsedData = data as unknown as OrderType;
    const messagesToSend: any[] = [
      (parsedData.addressPack && `Адреса пачкомату:${parsedData.addressPack}`) ||
        (parsedData.userAddress && `Ваша адреса: ${parsedData.userAddress}`),
      `Cума замовлення: ${totalPrice} ${activePrice}`,
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
  };
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
        totalPrice,
        totalWeight,
        freeDelivery,
        isCatExist,
        activePrice,
        rightShipPrice,
        rightCurrentCountry,
      } = dataFromResponse;
      const calcTotalPrice = +totalPrice + Number(rightShipPrice);

      //parse data

      const parsedData = JSON.parse(data!);
      const parsedProducts = JSON.parse(products);

      const addressPack = parsedData.addressPack || '';
      const userAddress = parsedData.userAddress || '';
      const country = rightCurrentCountry;
      const userCity = parsedData.userCity;
      const userIndexCity = parsedData.userIndexCity;
      const userNickname = userFromWeb;
      const email = parsedData.email;
      const actualPrice = activePrice as ActualPriceType;

      //check if products quantity is zero

      const { listOfElements, isNotExits } = await checkEnableProductsService(parsedProducts);

      if (isNotExits) {
        for (const el of listOfElements) {
          const message = `Пробачте,але ${el.title} вже закінчився,замовте щось інше`;
          await bot.sendMessage(chatId, message);
        }
      }

      //update quantinty of products

      await changeQuantityOfProductsService(parsedProducts);

      //upload cat pic to server and get url
      const imgUrl = catPic ? (await uploadFileToMediaServer(catPic.buffer, 'image/jpeg')).url : '';

      await createOrderService({
        uniqueId: chatId,
        orderData: {
          orderNumber: orderNumber,
          contactPhoneNumber: userPhoneNumber,
          phoneNumber: parsedData.phoneNumber,
          userNickname,
          userAddress,
          userCountry: country,
          userCity,
          userIndexCity: userIndexCity!,
          userLastName: parsedData.userLastName,
          userName: parsedData.userName,
          isCatExist: isCatExist === 'true' ? true : false,
          addressPack,
          orderComeFrom: 'telegram_bot',
          catExistConfirmPicUrl: imgUrl,
          freeDelivery: freeDelivery === 'true' ? true : false,
          activePrice: actualPrice,
          totalPrice: Number(totalPrice!),
          email,
          price: calcTotalPrice,
          totalWeight: Number(totalWeight!),
          orderItems: products,
        },
      });

      const messageToGroup = `Нове замовлення ${orderNumber} через бот`;

      sendMessages({ data: parsedData, activePrice, totalPrice, totalWeight, orderNumber });
      await bot.sendMessage(group_chat, messageToGroup);

      //send user audio request

      bot.sendMessage(chatId, 'Чи бажаєте додати аудіо привітання до замовлення?', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Ні',
                callback_data: JSON.stringify({ confirm: 'sendAudio', chat_id: chatId }),
              },
            ],
            [
              {
                text: 'Так',
                callback_data: JSON.stringify({ confirm: 'sendAudio', chat_id: chatId }),
              },
            ],
          ],
        },
      });
    } catch (e) {
      console.error('Error parsing data:', e);
    }
  } else {
    throw new Error('User dosent found');
  }
}
