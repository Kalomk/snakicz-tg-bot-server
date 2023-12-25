import { prisma } from '../../../';

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

export { createOrFindExistUser, getAllUsers, userDelete };
