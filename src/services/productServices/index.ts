import { prisma } from '../../..';

const checkEnableProducts = async (products: ProductType[]) => {
  const disabledProducts = await prisma.product.findMany({
    where: { totalWeightProduct: 0, id: { in: products.map(({ id }) => id) } },
  });

  return {
    isExits: disabledProducts.length > 0,
    listOfElements: disabledProducts,
  };
};

const createANewProduct = async (newProduct: ProductType) => {
  try {
    await prisma.product.create({
      data: {
        ...newProduct,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

const getProducts = async () => {
  return await prisma.product.findMany();
};

const updateProduct = async ({ id, newData }: { id: number; newData: ProductType }) => {
  try {
    await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...newData,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

const updateUserOrderStatus = async (orderNumber: string, status: UserOrderStatus) => {
  try {
    await prisma.order.update({
      where: { orderNumber },
      data: {
        [`op_${status}`]: true,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

const changeQuantityOfProduct = async (products: ProductType[]) => {
  const transaction = await prisma.$transaction(
    products.map(({ id, totalWeightProduct }) =>
      prisma.product.update({
        where: { id },
        data: { totalWeightProduct },
      })
    )
  );

  return transaction;
};

export {
  createANewProduct,
  updateUserOrderStatus,
  updateProduct,
  getProducts,
  changeQuantityOfProduct,
};
