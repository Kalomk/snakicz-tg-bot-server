import { prisma } from '../..';

interface OrderType {
  userName: string; // Им'я та Прізвище
  userLastName: string; // Им'я та Прізвище
  addressPack: string; // Адреса-Пачкомату
  userAddress: string; // Адреса-покупця
  userCity: string; // Місто
  userIndexCity: string; // Індекс
  userNickname: string; // Нік
  isCatExist: boolean; // Є котик
  orderNumber: string; // Номер замовлення
  freeDelivery: boolean; // Безкоштовна доставка
  totalPrice: number; // Сума замовлення
  activePrice: string; // Активна валюта
  phoneNumber: string; // Номер телефону для відправки
  contactPhoneNumber: string; // Номер телефону для контакту
  email: string; // Емейл
  totalWeight: number; // Вага замовлення
  orderItems: string;
}

const createOrFindExistUser = async ({
  chatId,
  phoneNumber,
}: {
  chatId: number;
  phoneNumber: string;
}): Promise<
  | {
      id: number;
      chatId: number;
      phoneNumber: string;
      isFirstTimeBuy: boolean;
      ordersCount: number;
      createdAt: Date;
      updatedAt: Date;
    }
  | undefined
> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        chatId,
      },
    });

    if (user) return user;

    return prisma.user.create({
      data: {
        chatId,
        phoneNumber,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

// Controller function to create a new order associated with a user
const createOrder = async ({ chatId, orderData }: { chatId: number; orderData: OrderType }) => {
  try {
    // Find the user by chatId
    const user = await prisma.user.findUnique({
      where: { chatId },
    });

    if (!user) {
      throw new Error(`User with chatId ${chatId} not found.`);
    }

    // Create a new order associated with the user
    const newOrder = await prisma.order.create({
      data: {
        userId: user.chatId,
        ...orderData,
      },
    });

    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// // Update a user by chatId
// const updateUser = async ({ chatId, data }) => {
//   try {
//     const updatedUser = await prisma.user.update({
//       where: { chatId },
//       data,
//     });
//     return updatedUser;
//   } catch (error) {
//     console.error('Error updating user:', error);
//     throw error;
//   }
// };

// Get an order by orderNumber
const getOrder = async (orderNumber: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Get all orders for a specific user (by chatId)
const getOrders = async (chatId: number) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: chatId },
    });
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};
export { createOrFindExistUser, getOrders, getOrder, createOrder };
