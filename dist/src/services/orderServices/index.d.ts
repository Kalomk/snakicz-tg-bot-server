import { OrderType } from '@/types';
declare const getAllOrders: () => Promise<
  {
    id: number;
    userName: string;
    userLastName: string;
    userCountry: string;
    addressPack: string;
    userAddress: string;
    userCity: string;
    userIndexCity: string;
    userNickname: string;
    isCatExist: boolean;
    orderNumber: string;
    freeDelivery: boolean;
    totalPrice: number;
    activePrice: string;
    phoneNumber: string;
    contactPhoneNumber: string;
    email: string;
    totalWeight: number;
    orderItems: import('.prisma/client').Prisma.JsonValue;
    isStatisted: boolean;
    price: number;
    paymentConfirmPicUrl: string;
    catExistConfirmPicUrl: string;
    op_isConfirmationOrderSended: boolean;
    op_isConfirmationPaymentSended: boolean;
    op_isPacNumberSended: boolean;
    op_isActualize: boolean;
    orderComeFrom: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  }[]
>;
declare const orderDelete: (orderNumber: string) =>
  | never[]
  | import('.prisma/client').Prisma.Prisma__OrderClient<
      {
        id: number;
        userName: string;
        userLastName: string;
        userCountry: string;
        addressPack: string;
        userAddress: string;
        userCity: string;
        userIndexCity: string;
        userNickname: string;
        isCatExist: boolean;
        orderNumber: string;
        freeDelivery: boolean;
        totalPrice: number;
        activePrice: string;
        phoneNumber: string;
        contactPhoneNumber: string;
        email: string;
        totalWeight: number;
        orderItems: import('.prisma/client').Prisma.JsonValue;
        isStatisted: boolean;
        price: number;
        paymentConfirmPicUrl: string;
        catExistConfirmPicUrl: string;
        op_isConfirmationOrderSended: boolean;
        op_isConfirmationPaymentSended: boolean;
        op_isPacNumberSended: boolean;
        op_isActualize: boolean;
        orderComeFrom: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
      },
      never,
      import('@prisma/client/runtime/library').DefaultArgs
    >;
declare const createOrder: ({
  uniqueId,
  orderData,
}: {
  uniqueId: number;
  orderData: OrderType;
}) => Promise<{
  id: number;
  userName: string;
  userLastName: string;
  userCountry: string;
  addressPack: string;
  userAddress: string;
  userCity: string;
  userIndexCity: string;
  userNickname: string;
  isCatExist: boolean;
  orderNumber: string;
  freeDelivery: boolean;
  totalPrice: number;
  activePrice: string;
  phoneNumber: string;
  contactPhoneNumber: string;
  email: string;
  totalWeight: number;
  orderItems: import('.prisma/client').Prisma.JsonValue;
  isStatisted: boolean;
  price: number;
  paymentConfirmPicUrl: string;
  catExistConfirmPicUrl: string;
  op_isConfirmationOrderSended: boolean;
  op_isConfirmationPaymentSended: boolean;
  op_isPacNumberSended: boolean;
  op_isActualize: boolean;
  orderComeFrom: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}>;
declare const getLastAddedOrderForUser: (uniqueId: number) => Promise<{
  id: number;
  userName: string;
  userLastName: string;
  userCountry: string;
  addressPack: string;
  userAddress: string;
  userCity: string;
  userIndexCity: string;
  userNickname: string;
  isCatExist: boolean;
  orderNumber: string;
  freeDelivery: boolean;
  totalPrice: number;
  activePrice: string;
  phoneNumber: string;
  contactPhoneNumber: string;
  email: string;
  totalWeight: number;
  orderItems: import('.prisma/client').Prisma.JsonValue;
  isStatisted: boolean;
  price: number;
  paymentConfirmPicUrl: string;
  catExistConfirmPicUrl: string;
  op_isConfirmationOrderSended: boolean;
  op_isConfirmationPaymentSended: boolean;
  op_isPacNumberSended: boolean;
  op_isActualize: boolean;
  orderComeFrom: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
} | null>;
declare const getOrdersByUserId: (uniqueId: number) => Promise<
  {
    id: number;
    userName: string;
    userLastName: string;
    userCountry: string;
    addressPack: string;
    userAddress: string;
    userCity: string;
    userIndexCity: string;
    userNickname: string;
    isCatExist: boolean;
    orderNumber: string;
    freeDelivery: boolean;
    totalPrice: number;
    activePrice: string;
    phoneNumber: string;
    contactPhoneNumber: string;
    email: string;
    totalWeight: number;
    orderItems: import('.prisma/client').Prisma.JsonValue;
    isStatisted: boolean;
    price: number;
    paymentConfirmPicUrl: string;
    catExistConfirmPicUrl: string;
    op_isConfirmationOrderSended: boolean;
    op_isConfirmationPaymentSended: boolean;
    op_isPacNumberSended: boolean;
    op_isActualize: boolean;
    orderComeFrom: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  }[]
>;
export { getOrdersByUserId, getAllOrders, orderDelete, getLastAddedOrderForUser, createOrder };
