"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const userService_1 = require("../services/userService");
const __1 = require("../..");
const createOrFindExistUser = async (req, res) => {
    try {
        const { uniqueId, phoneNumber } = req.body;
        const user = await (0, userService_1.createOrFindExistUserService)({ uniqueId, phoneNumber });
        return res.json(user);
    }
    catch (e) {
        console.log(e);
    }
};
const getAllUsers = () => {
    try {
        return __1.prisma.user.findMany();
    }
    catch (e) {
        console.log(e);
        return [];
    }
};
const userDelete = async (req, res) => {
    try {
        const { uniqueId } = req.body;
        return __1.prisma.user.delete({ where: { uniqueId } });
    }
    catch (e) {
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
exports.Users = { createOrFindExistUser, getAllUsers, userDelete };
//# sourceMappingURL=users.js.map