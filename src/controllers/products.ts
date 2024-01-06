import { ProductType } from '@/types';
import { prisma } from '../..';
import { ControllerFunctionType } from '@/types';

const createANewProduct: ControllerFunctionType = async (req, res) => {
  try {
    const { newProduct } = req.body;
    const newAddedProduct = await prisma.product.create({
      data: {
        ...newProduct,
      },
    });
    return res.json(newAddedProduct);
  } catch (e) {
    console.log(e);
  }
};

const getProducts: ControllerFunctionType = async () => {
  return await prisma.product.findMany();
};

const updateProduct: ControllerFunctionType = async (req, res) => {
  try {
    const { id, newData } = req.body;
    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...newData,
      },
    });
    return res.json(updatedProduct);
  } catch (e) {
    console.log(e);
  }
};

const deleteProduct: ControllerFunctionType = async (req, res) => {
  try {
    const { id } = req.body;
    const del = await prisma.product.delete({ where: { id } });
    res.json(del);
  } catch (e) {
    console.log(e);
  }
};

const changeQuantityOfProduct: ControllerFunctionType = async (req, res) => {
  try {
    const productsFromReq: ProductType[] = req.body.products;
    const transaction = await prisma.$transaction(
      productsFromReq.map(({ id, totalWeightProduct }) =>
        prisma.product.update({
          where: { id },
          data: { totalWeightProduct },
        })
      )
    );

    return res.json(transaction);
  } catch (e) {
    console.log(e);
  }
};

export const Products = {
  createANewProduct,
  updateProduct,
  getProducts,
  changeQuantityOfProduct,
  deleteProduct,
};
