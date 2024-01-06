import { createOrFindExistUserService } from '@/services/userService';
import { prisma } from '../..';
import { ControllerFunctionType } from '@/types';

const createOrFindExistUser: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId, phoneNumber } = req.body;
    const user = await createOrFindExistUserService({ uniqueId, phoneNumber });
    return res.json(user);
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
const userDelete: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId } = req.body;

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

export const Users = { createOrFindExistUser, getAllUsers, userDelete };
