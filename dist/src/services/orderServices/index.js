"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.getLastAddedOrderForUser = exports.orderDelete = exports.getAllOrders = exports.getOrdersByUserId = void 0;
const __1 = require("../../../");
const getAllOrders = async () => {
    try {
        return await __1.prisma.order.findMany();
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
exports.getAllOrders = getAllOrders;
const orderDelete = (orderNumber) => {
    try {
        return __1.prisma.order.delete({ where: { orderNumber } });
    }
    catch (e) {
        console.log(e);
        return [];
    }
};
exports.orderDelete = orderDelete;
// Controller function to create a new order associated with a user
const createOrder = async ({ uniqueId, orderData }) => {
    try {
        // Find the user by uniqueId
        const user = await __1.prisma.user.findUnique({
            where: { uniqueId: uniqueId.toString() },
        });
        if (!user) {
            throw new Error(`User with uniqueId ${uniqueId} not found.`);
        }
        // Create a new order associated with the user
        const newOrder = await __1.prisma.order.create({
            data: {
                userId: user.uniqueId,
                ...orderData,
            },
        });
        return newOrder;
    }
    catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};
exports.createOrder = createOrder;
// Get the last added order for a specific user
const getLastAddedOrderForUser = async (uniqueId) => {
    try {
        const user = await __1.prisma.user.findUnique({
            where: { uniqueId: uniqueId.toString() },
        });
        if (!user) {
            throw new Error(`User with uniqueId ${uniqueId} not found.`);
        }
        const order = await __1.prisma.order.findFirst({
            where: { userId: user.uniqueId },
            orderBy: { createdAt: 'desc' },
        });
        return order;
    }
    catch (error) {
        console.error('Error fetching last added order for user:', error);
        throw error;
    }
};
exports.getLastAddedOrderForUser = getLastAddedOrderForUser;
// Get all orders for a specific user (by uniqueId)
const getOrdersByUserId = async (uniqueId) => {
    try {
        const orders = await __1.prisma.order.findMany({
            where: { userId: uniqueId.toString() },
        });
        return orders;
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
exports.getOrdersByUserId = getOrdersByUserId;
//# sourceMappingURL=index.js.map