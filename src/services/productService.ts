import { CartItem } from '../../types';
import { prisma } from '../..';

export const checkEnableProductsService = async (cartItem: CartItem[]) => {
  const disabledProducts = await prisma.product.findMany({
    where: { totalWeightProduct: 0, title: { in: cartItem.map(({ title }) => title) } },
  });

  return {
    isNotExits: disabledProducts.length > 0,
    listOfElements: disabledProducts,
  };
};
