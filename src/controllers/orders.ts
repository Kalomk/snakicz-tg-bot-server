import { ControllerFunctionType } from '../../type';
import { prisma } from '../..';
import {
  createOrderService,
  getLastDataService,
  getOrderCountsByTypeService,
} from '../services/orderService';

const getOrders: ControllerFunctionType = async (req, res) => {
  try {
    const { page = 1, pageSize = '10' } = req.query;

    const parsedPageCount = parseInt(page as string);
    const parsedPageSize = parseInt(pageSize as string);

    const start = (parsedPageCount - 1) * parsedPageSize;
    // Fetch total count of orders
    const totalCount = await prisma.order.count();

    // Calculate the leftovers data size
    const leftoverDataSize = Math.max(totalCount - start, 0);

    const skip = Math.max(leftoverDataSize - parsedPageSize, 0);
    const take = leftoverDataSize >= parsedPageSize ? parsedPageSize : leftoverDataSize;
    // Fetch paginated data
    const paginatedData = await prisma.order.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' }, // Assuming 'createdAt' is the timestamp column
    });

    res.json(paginatedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getOrdersByDateRange: ControllerFunctionType = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: 'Both startDate and endDate are required in the query parameters.' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getOrdersBySearchThemNames: ControllerFunctionType = async (req, res) => {
  const { titles } = req.params;

  try {
    const userData = await prisma.order.findMany({
      where: {
        OR: [
          { userName: { contains: titles, mode: 'insensitive' } },
          { userLastName: { contains: titles, mode: 'insensitive' } },
        ],
      },
    });

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateUserOrderStatus: ControllerFunctionType = async (req, _) => {
  try {
    const { orderNumber, status } = req.body;

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

const orderDelete: ControllerFunctionType = async (req, res) => {
  try {
    const { orderNumber } = req.body;
    const deletedOrder = await prisma.order.delete({ where: { orderNumber } });
    return res.json(deletedOrder);
  } catch (e) {
    console.log(e);
    return [];
  }
};

// Controller function to create a new order associated with a user
const createOrder: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId, orderData } = req.body;
    const newOrder = createOrderService({ uniqueId, orderData });

    return res.json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

const getOrderCountsByType: ControllerFunctionType = async (_, res) => {
  try {
    // Find the orders by order comes frome
    const orderCount = getOrderCountsByTypeService();
    return res.json(orderCount);
  } catch (error) {
    console.error('Error find orders:', error);
    throw error;
  }
};
// Get the last added order for a specific user
const getLastAddedOrderForUser: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId } = req.body;
    const order = getLastDataService(uniqueId);
    return res.json(order);
  } catch (error) {
    console.error('Error fetching last added order for user:', error);
    throw error;
  }
};

// Get all orders for a specific user (by uniqueId)
const getOrdersByUniqueId: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId } = req.body;
    const orders = await prisma.order.findMany({
      where: { uniqueId: uniqueId.toString() },
    });
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const Orders = {
  getOrdersByUniqueId,
  getOrders,
  orderDelete,
  getOrdersBySearchThemNames,
  getOrdersByDateRange,
  getOrderCountsByType,
  getLastAddedOrderForUser,
  createOrder,
  updateUserOrderStatus,
};
