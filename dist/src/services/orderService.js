"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastDataService = exports.createOrderService = void 0;
const __1 = require("../..");
const createOrderService = async ({ uniqueId, orderData, }) => {
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
};
exports.createOrderService = createOrderService;
const getLastDataService = async (uniqueId) => {
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
};
exports.getLastDataService = getLastDataService;
//# sourceMappingURL=orderService.js.map