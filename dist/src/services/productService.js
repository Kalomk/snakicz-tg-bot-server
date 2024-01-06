"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnableProductsService = void 0;
const __1 = require("../..");
const checkEnableProductsService = async (products) => {
    const disabledProducts = await __1.prisma.product.findMany({
        where: { totalWeightProduct: 0, id: { in: products.map(({ id }) => id) } },
    });
    return {
        isExits: disabledProducts.length > 0,
        listOfElements: disabledProducts,
    };
};
exports.checkEnableProductsService = checkEnableProductsService;
//# sourceMappingURL=productService.js.map