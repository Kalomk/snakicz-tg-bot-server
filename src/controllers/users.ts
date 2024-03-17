import { createOrFindExistUserService } from '../services/userService';
import { prisma } from '../..';
import { ControllerFunctionType } from '../../types';

const createOrFindExistUser: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId, phoneNumber } = req.body;
    const user = await createOrFindExistUserService({ uniqueId, phoneNumber });
    return res.json(user);
  } catch (e) {
    console.log(e);
  }
};

const getUsers: ControllerFunctionType = async (req, res) => {
  try {
    const { page = 1, pageSize = '10' } = req.query;
    const start = (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const paginatedData = await prisma.user.findMany({
      skip: start,
      take: parseInt(pageSize as string),
    });

    res.json(paginatedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUsersByDateRange: ControllerFunctionType = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: 'Both startDate and endDate are required in the query parameters.' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
    });

    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const userDelete: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId } = req.body;

    const deletedUser = prisma.user.delete({ where: { uniqueId } });
    return res.json(deletedUser);
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

export const Users = { createOrFindExistUser, getUsers, getUsersByDateRange, userDelete };
