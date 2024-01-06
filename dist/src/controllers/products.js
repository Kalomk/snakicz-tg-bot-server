"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Products = void 0;
const __1 = require("../..");
const createANewProduct = async (req, res) => {
    try {
        const { newProduct } = req.body;
        const newAddedProduct = await __1.prisma.product.create({
            data: {
                ...newProduct,
            },
        });
        return res.json(newAddedProduct);
    }
    catch (e) {
        console.log(e);
    }
};
const getProducts = async () => {
    return await __1.prisma.product.findMany();
};
const updateProduct = async (req, res) => {
    try {
        const { id, newData } = req.body;
        const updatedProduct = await __1.prisma.product.update({
            where: {
                id,
            },
            data: {
                ...newData,
            },
        });
        return res.json(updatedProduct);
    }
    catch (e) {
        console.log(e);
    }
};
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const del = await __1.prisma.product.delete({ where: { id } });
        res.json(del);
    }
    catch (e) {
        console.log(e);
    }
};
const changeQuantityOfProduct = async (req, res) => {
    try {
        const productsFromReq = req.body.products;
        const transaction = await __1.prisma.$transaction(productsFromReq.map(({ id, totalWeightProduct }) => __1.prisma.product.update({
            where: { id },
            data: { totalWeightProduct },
        })));
        return res.json(transaction);
    }
    catch (e) {
        console.log(e);
    }
};
exports.Products = {
    createANewProduct,
    updateProduct,
    getProducts,
    changeQuantityOfProduct,
    deleteProduct,
};
//# sourceMappingURL=products.js.map