"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orders = void 0;
const __1 = require("../..");
const orderService_1 = require("../services/orderService");
const getAllOrders = async (_, res) => {
    try {
        const orders = await __1.prisma.order.findMany();
        return res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
const updateUserOrderStatus = async (req, _) => {
    try {
        const { orderNumber, status } = req.body;
        await __1.prisma.order.update({
            where: { orderNumber },
            data: {
                [`op_${status}`]: true,
            },
        });
    }
    catch (e) {
        console.log(e);
    }
};
const orderDelete = async (req, res) => {
    try {
        const { orderNumber } = req.body;
        const deletedOrder = __1.prisma.order.delete({ where: { orderNumber } });
        return res.json(deletedOrder);
    }
    catch (e) {
        console.log(e);
        return [];
    }
};
// Controller function to create a new order associated with a user
const createOrder = async (req, res) => {
    try {
        // Find the user by uniqueId
        const { uniqueId, orderData } = req.body;
        const newOrder = (0, orderService_1.createOrderService)({ uniqueId, orderData });
        return res.json(newOrder);
    }
    catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};
// Get the last added order for a specific user
const getLastAddedOrderForUser = async (req, res) => {
    try {
        const { uniqueId } = req.body;
        const order = (0, orderService_1.getLastDataService)(uniqueId);
        return res.json(order);
    }
    catch (error) {
        console.error('Error fetching last added order for user:', error);
        throw error;
    }
};
// Get all orders for a specific user (by uniqueId)
const getOrdersByUserId = async (req, res) => {
    try {
        const { uniqueId } = req.body;
        const orders = await __1.prisma.order.findMany({
            where: { userId: uniqueId.toString() },
        });
        return res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
exports.Orders = {
    getOrdersByUserId,
    getAllOrders,
    orderDelete,
    getLastAddedOrderForUser,
    createOrder,
    updateUserOrderStatus,
};
//# sourceMappingURL=orders.js.map