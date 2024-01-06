import { prisma } from '../..';

export const createOrFindExistUserService = async ({
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
