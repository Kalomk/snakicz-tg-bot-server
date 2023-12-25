import { prisma } from '../../../';

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

export { getOrdersByUserId, getAllOrders, orderDelete, getLastAddedOrderForUser, createOrder };
