"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.getLastAddedOrderForUser = exports.getOrders = exports.createOrFindExistUser = void 0;
const __1 = require("../..");
const client_1 = require("@prisma/client");
const createOrFindExistUser = async ({ chatId, phoneNumber, }) => {
    try {
        const user = await __1.prisma.user.findUnique({
            where: {
                chatId,
            },
        });
        if (user)
            return user;
        return __1.prisma.user.create({
            data: {
                chatId,
                phoneNumber,
            },
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.createOrFindExistUser = createOrFindExistUser;
// Controller function to create a new order associated with a user
const createOrder = async ({ chatId, orderData }) => {
    try {
        // Find the user by chatId
        const user = await __1.prisma.user.findUnique({
            where: { chatId },
        });
        if (!user) {
            throw new Error(`User with chatId ${chatId} not found.`);
        }
        // Create a new order associated with the user
        const newOrder = await __1.prisma.order.create({
            data: {
                userId: user.chatId,
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
// // Update a user by chatId
// const updateUser = async ({ chatId, data }) => {
//   try {
//     const updatedUser = await prisma.user.update({
//       where: { chatId },
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
// Get the last added order for a specific user
const getLastAddedOrderForUser = async (chatId) => {
    try {
        const user = await __1.prisma.user.findUnique({
            where: { chatId },
        });
        if (!user) {
            throw new Error(`User with chatId ${chatId} not found.`);
        }
        const order = await __1.prisma.order.findFirst({
            where: { userId: user.chatId },
            orderBy: { createdAt: client_1.Prisma.SortOrder.desc },
        });
        return order;
    }
    catch (error) {
        console.error('Error fetching last added order for user:', error);
        throw error;
    }
};
exports.getLastAddedOrderForUser = getLastAddedOrderForUser;
// Get all orders for a specific user (by chatId)
const getOrders = async (chatId) => {
    try {
        const orders = await __1.prisma.order.findMany({
            where: { userId: chatId },
        });
        return orders;
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
exports.getOrders = getOrders;
//# sourceMappingURL=controller.js.map