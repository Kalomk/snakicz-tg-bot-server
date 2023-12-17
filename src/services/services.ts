import { prisma } from '../..';

interface OrderType {
  userName: string; // Им'я та Прізвище
  userLastName: string; // Им'я та Прізвище
  userCountry: string;
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
  price: number;

  paymentConfirmPicUrl?: string;
  catExistConfirmPicUrl?: string;

  op_isConfirmationOrderSended?: boolean;
  op_isConfirmationPaymentSended?: boolean;
  op_isPacNumberSended?: boolean;
  op_isActualize?: boolean;

  orderComeFrom?: 'telegram' | 'instagram' | 'tikTok' | 'fb' | 'web';
}

export type UserOrderStatus =
  | 'isConfirmationOrderSended'
  | 'isConfirmationPaymentSended'
  | 'isPacNumberSended'
  | 'isActualize';

export interface ProductType {
  id: number;
  title: string;
  price: { zł: number[]; '€': number[] };
  img: string;
  weight: number[];
  description?: string;
  totalProductWeight: number;
  isEnable: boolean;
  category: number;
  totalWeightProduct: number;
  totalProductWeightFromProducts: { [id: number]: number };
}

const createOrFindExistUser = async ({
  uniqueId,
  phoneNumber,
}: {
  uniqueId: string;
  phoneNumber: string;
}): Promise<
  | {
      id: number;
      uniqueId: string;
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
        uniqueId: uniqueId.toString(),
      },
    });

    if (user) return user;

    return prisma.user.create({
      data: {
        uniqueId: uniqueId.toString(),
        phoneNumber,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

const getAllUsers = () => {
  try {
    return prisma.user.findMany();
  } catch (e) {
    console.log(e);
    return [];
  }
};
const userDelete = (uniqueId: string) => {
  try {
    return prisma.user.delete({ where: { uniqueId } });
  } catch (e) {
    console.log(e);
    return [];
  }
};

const getAllOrders = async () => {
  try {
    return await prisma.order.findMany();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const orderDelete = (orderNumber: string) => {
  try {
    return prisma.order.delete({ where: { orderNumber } });
  } catch (e) {
    console.log(e);
    return [];
  }
};

// Controller function to create a new order associated with a user
const createOrder = async ({ uniqueId, orderData }: { uniqueId: number; orderData: OrderType }) => {
  try {
    // Find the user by uniqueId
    const user = await prisma.user.findUnique({
      where: { uniqueId: uniqueId.toString() },
    });

    if (!user) {
      throw new Error(`User with uniqueId ${uniqueId} not found.`);
    }

    // Create a new order associated with the user
    const newOrder = await prisma.order.create({
      data: {
        userId: user.uniqueId,
        ...orderData,
      },
    });

    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// // Update a user by uniqueId
// const updateUser = async ({ uniqueId, data }) => {
//   try {
//     const updatedUser = await prisma.user.update({
//       where: { uniqueId },
//       data,
//     });
//     return updatedUser;
//   } catch (error) {
//     console.error('Error updating user:', error);
//     throw error;
//   }
// };

// Get an order by orderNumber
// const getOrder = async (orderNumber: string) => {
//   try {
//     const order = await prisma.order.findUnique({
//       where: { orderNumber },
//     });
//     return order;
//   } catch (error) {
//     console.error('Error fetching order:', error);
//     throw error;
//   }
// };

// Get the last added order for a specific user
const getLastAddedOrderForUser = async (uniqueId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { uniqueId: uniqueId.toString() },
    });

    if (!user) {
      throw new Error(`User with uniqueId ${uniqueId} not found.`);
    }

    const order = await prisma.order.findFirst({
      where: { userId: user.uniqueId },
      orderBy: { createdAt: 'desc' } as any,
    });

    return order;
  } catch (error) {
    console.error('Error fetching last added order for user:', error);
    throw error;
  }
};

// Get all orders for a specific user (by uniqueId)
const getOrdersByUserId = async (uniqueId: number) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: uniqueId.toString() },
    });
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const createANewProduct = async (newProduct: ProductType) => {
  try {
    await prisma.product.create({
      data: {
        ...newProduct,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

const updateProduct = async (id: number, newData: ProductType) => {
  try {
    await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...newData,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

const updateUserOrderStatus = async (orderNumber: string, status: UserOrderStatus) => {
  try {
    await prisma.order.update({
      where: { orderNumber },
      data: {
        [`op_${status}`]: true,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

export {
  createOrFindExistUser,
  getOrdersByUserId,
  getAllOrders,
  getAllUsers,
  orderDelete,
  userDelete,
  getLastAddedOrderForUser,
  createOrder,
  createANewProduct,
  updateUserOrderStatus,
  updateProduct,
};
