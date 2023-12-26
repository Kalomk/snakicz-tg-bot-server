"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeQuantityOfProduct = exports.getProducts = exports.updateProduct = exports.updateUserOrderStatus = exports.createANewProduct = void 0;
const __1 = require("../../..");
const checkEnableProducts = async (products) => {
    const disabledProducts = await __1.prisma.product.findMany({
        where: { totalWeightProduct: 0, id: { in: products.map(({ id }) => id) } },
    });
    return {
        isExits: disabledProducts.length > 0,
        listOfElements: disabledProducts,
    };
};
const createANewProduct = async (newProduct) => {
    try {
        await __1.prisma.product.create({
            data: {
                ...newProduct,
            },
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.createANewProduct = createANewProduct;
const getProducts = async () => {
    return await __1.prisma.product.findMany();
};
exports.getProducts = getProducts;
const updateProduct = async ({ id, newData }) => {
    try {
        await __1.prisma.product.update({
            where: {
                id,
            },
            data: {
                ...newData,
            },
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.updateProduct = updateProduct;
const updateUserOrderStatus = async (orderNumber, status) => {
    try {
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
exports.updateUserOrderStatus = updateUserOrderStatus;
const changeQuantityOfProduct = async (products) => {
    const transaction = await __1.prisma.$transaction(products.map(({ id, totalWeightProduct }) => __1.prisma.product.update({
        where: { id },
        data: { totalWeightProduct },
    })));
    return transaction;
};
exports.changeQuantityOfProduct = changeQuantityOfProduct;
//# sourceMappingURL=index.js.map