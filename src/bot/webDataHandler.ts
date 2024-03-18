import { uploadFileToMediaServer } from '../utils';
import { group_chat, prisma, bot } from '../..';
import { FormData, OrderType, ActualPriceType } from '../../types';
import { createOrderService } from '../services/orderService';
import { checkEnableProductsService } from '../services/productService';

interface DataFromResponse {
  data?: OrderType;
  products: any[]; // Update this type based on your actual product data structure
  totalPrice: number;
  totalWeight: number;
  freeDelivery: boolean;
  isCatExist: boolean;
  activePrice: string;
  rightShipPrice: string;
  rightCurrentCountry: string;
  orderNumber?: string;
}

export async function webDataHandler(requestedData: FormData) {
  const { chatId, userFromWeb, products, catPic, ...dataFromResponse } = requestedData;

  const sendMessages = async ({
    data,
    totalPrice,
    activePrice,
    totalWeight,
    orderNumber,
  }: Partial<DataFromResponse>) => {
    const messagesToSend: any[] = [
      (data?.addressPack && `Адреса пачкомату:${data?.addressPack}`) ||
        (data?.userAddress && `Ваша адреса: ${data?.userAddress}`),
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
      } = dataFromResponse as unknown as DataFromResponse;
      const calcTotalPrice = +totalPrice + Number(rightShipPrice);

      const addressPack = data!.addressPack || '';
      const userAddress = data!.userAddress || '';
      const country = rightCurrentCountry;
      const userCity = data!.userCity;
      const userIndexCity = data?.userIndexCity;
      const userNickname = userFromWeb;
      const email = data!.email;
      const actualPrice = activePrice as ActualPriceType;

      const { listOfElements, isNotExits } = await checkEnableProductsService(products);

      if (isNotExits) {
        for (const el of listOfElements) {
          const message = `Пробачте,але ${el.title} вже закінчився,замовте щось інше`;
          await bot.sendMessage(chatId, message);
        }
      }

      //upload cat pic to server and get url
      const imgUrl = catPic ? (await uploadFileToMediaServer(catPic.buffer)).imgUrl : '';

      await createOrderService({
        uniqueId: chatId,
        orderData: {
          orderNumber: JSON.stringify(orderNumber),
          contactPhoneNumber: userPhoneNumber,
          phoneNumber: data!.phoneNumber,
          userNickname,
          userAddress,
          userCountry: country,
          userCity,
          userIndexCity: userIndexCity!,
          userLastName: data!.userLastName,
          userName: data!.userName,
          isCatExist,
          addressPack,
          catExistConfirmPicUrl: imgUrl,
          freeDelivery,
          activePrice: actualPrice,
          totalPrice: totalPrice!,
          email,
          price: calcTotalPrice,
          totalWeight: totalWeight!,
          orderItems: JSON.stringify(products),
        },
      });

      const messageToGroup = `Нове замовлення ${orderNumber} через бот`;

      sendMessages({ data, activePrice, totalPrice, totalWeight, orderNumber });
      await bot.sendMessage(group_chat, messageToGroup);
    } catch (e) {
      console.error('Error parsing data:', e);
    }
  } else {
    throw new Error('User dosent found');
  }
}
