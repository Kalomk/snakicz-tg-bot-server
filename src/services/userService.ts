import { UserDataTypes } from 'types';
import { prisma } from '../..';

export const createOrFindExistUserService = async ({
  uniqueId,
  phoneNumber,
  status = 'user',
  password = '',
}: {
  uniqueId: string;
  phoneNumber: string;
  status?: string;
  password?: string;
}): Promise<UserDataTypes> => {
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
        password,
        status,
      },
    });
  } catch (e) {
    console.log(e);
    return [] as unknown as UserDataTypes;
  }
};
