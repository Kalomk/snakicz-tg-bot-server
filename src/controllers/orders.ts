import { ControllerFunctionType } from '@/types';
import { prisma } from '../..';
import { createOrderService, getLastDataService } from '@/services/orderService';

const getAllOrders: ControllerFunctionType = async (_, res) => {
  try {
    const orders = await prisma.order.findMany();
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
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
    const deletedOrder = prisma.order.delete({ where: { orderNumber } });
    return res.json(deletedOrder);
  } catch (e) {
    console.log(e);
    return [];
  }
};

// Controller function to create a new order associated with a user
const createOrder: ControllerFunctionType = async (req, res) => {
  try {
    // Find the user by uniqueId
    const { uniqueId, orderData } = req.body;
    const newOrder = createOrderService({ uniqueId, orderData });
    return res.json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
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
const getOrdersByUserId: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId } = req.body;
    const orders = await prisma.order.findMany({
      where: { userId: uniqueId.toString() },
    });
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const Orders = {
  getOrdersByUserId,
  getAllOrders,
  orderDelete,
  getLastAddedOrderForUser,
  createOrder,
  updateUserOrderStatus,
};
