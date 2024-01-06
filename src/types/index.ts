import { Request, Response } from 'express';

export type ControllerFunctionType = (req: Request, res: Response) => Promise<any>;

export interface OrderType {
  userName: string; // Им'я та Прізвище
  userLastName: string; // Им'я та Прізвище
  userCountry: string;
  addressPack: string; // Адреса-Пачкомату
  userAddress: string; // Адреса-покупця
  userCity: string; // Місто
  userIndexCity: string; // Індекс
  userNickname: string; // Нік
  isCatExist: boolean; // Є котик
  orderNumber: string; // Номер замовлення
  freeDelivery: boolean; // Безкоштовна доставка
  totalPrice: number; // Сума замовлення
  activePrice: string; // Активна валюта
  phoneNumber: string; // Номер телефону для відправки
  contactPhoneNumber: string; // Номер телефону для контакту
  email: string; // Емейл
  totalWeight: number; // Вага замовлення
  orderItems: string;
  price: number;

  paymentConfirmPicUrl?: string;
  catExistConfirmPicUrl?: string;

  op_isConfirmationOrderSended?: boolean;
  op_isConfirmationPaymentSended?: boolean;
  op_isPacNumberSended?: boolean;
  op_isActualize?: boolean;

  orderComeFrom?: 'telegram' | 'instagram' | 'tikTok' | 'fb' | 'web';
}

export type UserOrderStatus =
  | 'isConfirmationOrderSended'
  | 'isConfirmationPaymentSended'
  | 'isPacNumberSended'
  | 'isActualize';

export interface ProductType {
  id: number;
  title: string;
  price: { [key: string]: number };
  '€': { [key: string]: number };
  img: string;
  weight: number[];
  description?: string;
  totalWeightProduct: number;
  isEnable: boolean;
  category: number;
  totalProductWeightFromProducts: { [id: number]: number };
}

export interface UserDataTypes {
  userName: string;
  userLastName: string;
  phoneNumber: string;
  email: string;
  userIndexCity: string;
  addressPack?: string;
  userCity: string;
  userAddress?: string;
  catPic: undefined | string;
}

export type CartItem = {
  title: string;
  imageUrl: string;
  price: number;
  weight: number;
  id: string | string;
  count: number;
  activePrice: 'zł' | '€';
  activeCountry: string;
};

export interface FormData {
  data: UserDataTypes;
  totalPrice: number;
  totalWeight: number;
  activePrice: string;
  rightCurrentCountry: string;
  rightShipPrice: number;
  isCatExist: boolean;
  freeDelivery: boolean;
  products: CartItem[]; // Assuming OrderItem is another type/interface
  userFromWeb: string; // Assuming UserType is another type/interface
  chatId: string;
}
