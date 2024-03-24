import { ControllerFunctionType } from '../../type';
import { ProductType } from 'types';
import { prisma } from '../..';
import { changeQuantityOfProductsService } from '../services/productService';

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

const getProducts: ControllerFunctionType = async (_, res) => {
  const products = await prisma.product.findMany();
  return res.json(products);
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
    const updatedProducts = await changeQuantityOfProductsService(req.body);
    return res.json(updatedProducts);
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
