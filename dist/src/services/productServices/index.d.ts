import { ProductType, UserOrderStatus } from '@/types';
declare const createANewProduct: (newProduct: ProductType) => Promise<void>;
declare const getProducts: () => Promise<
  {
    id: number;
    title: string;
    price: import('.prisma/client').Prisma.JsonValue;
    img: string;
    weight: number[];
    description: string | null;
    isEnable: boolean;
    category: number;
    totalWeightProduct: number;
    totalProductWeightFromProducts: import('.prisma/client').Prisma.JsonValue;
  }[]
>;
declare const updateProduct: ({
  id,
  newData,
}: {
  id: number;
  newData: ProductType;
}) => Promise<void>;
declare const updateUserOrderStatus: (
  orderNumber: string,
  status: UserOrderStatus
) => Promise<void>;
declare const changeQuantityOfProduct: (products: ProductType[]) => Promise<
  {
    id: number;
    title: string;
    price: import('.prisma/client').Prisma.JsonValue;
    img: string;
    weight: number[];
    description: string | null;
    isEnable: boolean;
    category: number;
    totalWeightProduct: number;
    totalProductWeightFromProducts: import('.prisma/client').Prisma.JsonValue;
  }[]
>;
export {
  createANewProduct,
  updateUserOrderStatus,
  updateProduct,
  getProducts,
  changeQuantityOfProduct,
};
