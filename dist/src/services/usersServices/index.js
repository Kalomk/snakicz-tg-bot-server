"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDelete = exports.getAllUsers = exports.createOrFindExistUser = void 0;
const __1 = require("../../../");
const createOrFindExistUser = async ({ uniqueId, phoneNumber, }) => {
    try {
        const user = await __1.prisma.user.findUnique({
            where: {
                uniqueId: uniqueId.toString(),
            },
        });
        if (user)
            return user;
        return __1.prisma.user.create({
            data: {
                uniqueId: uniqueId.toString(),
                phoneNumber,
            },
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.createOrFindExistUser = createOrFindExistUser;
const getAllUsers = () => {
    try {
        return __1.prisma.user.findMany();
    }
    catch (e) {
        console.log(e);
        return [];
    }
};
exports.getAllUsers = getAllUsers;
const userDelete = (uniqueId) => {
    try {
        return __1.prisma.user.delete({ where: { uniqueId } });
    }
    catch (e) {
        console.log(e);
        return [];
    }
};
exports.userDelete = userDelete;
//# sourceMappingURL=index.js.map