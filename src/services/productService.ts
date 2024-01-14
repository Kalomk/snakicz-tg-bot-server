import { OrderType, ProductType, UserOrderStatus } from '../../types';
import { prisma } from '../..';

export const checkEnableProductsService = async (products: ProductType[]) => {
  const disabledProducts = await prisma.product.findMany({
    where: { totalWeightProduct: 0, id: { in: products.map(({ id }) => id) } },
  });

  return {
    isExits: disabledProducts.length > 0,
    listOfElements: disabledProducts,
  };
};
