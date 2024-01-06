"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrFindExistUserService = void 0;
const __1 = require("../..");
const createOrFindExistUserService = async ({ uniqueId, phoneNumber, }) => {
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
exports.createOrFindExistUserService = createOrFindExistUserService;
//# sourceMappingURL=userService.js.map