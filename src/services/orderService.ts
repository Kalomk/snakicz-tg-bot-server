import { OrderType } from '@/types';
import { prisma } from '../..';

export const createOrderService = async ({
  uniqueId,
  orderData,
}: {
  uniqueId: string;
  orderData: OrderType;
}) => {
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
};

export const getLastDataService = async (uniqueId: string) => {
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
};
