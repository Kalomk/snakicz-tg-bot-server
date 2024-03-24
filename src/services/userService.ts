import { prisma } from '../..';

export const createOrFindExistUserService = async ({
  uniqueId,
  phoneNumber,
  status = 'user',
}: {
  uniqueId: string;
  phoneNumber: string;
  status?: string;
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
        status,
      },
    });
  } catch (e) {
    console.log(e);
  }
};
