export type ActualPriceType = 'zł' | '€';

export type OrderComeFromType = 'telegram' | 'instagram' | 'tikTok' | 'fb' | 'web' | 'telegram_bot';

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
  activePrice: ActualPriceType; // Активна валюта
  phoneNumber: string; // Номер телефону для відправки
  contactPhoneNumber: string; // Номер телефону для контакту
  email: string; // Емейл
  totalWeight: number; // Вага замовлення
  orderItems: string;
  price: number;

  isStatisted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  paymentConfirmPicUrl?: string;
  catExistConfirmPicUrl?: string;
  specialOcasionAudioUrl?: string;

  op_isConfirmationOrderSended?: boolean;
  op_isConfirmationPaymentSended?: boolean;
  op_isPacNumberSended?: boolean;
  op_isActualize?: boolean;

  orderComeFrom?: OrderComeFromType;
}

export type UserOrderStatus =
  | 'isConfirmationOrderSended'
  | 'isConfirmationPaymentSended'
  | 'isPacNumberSended'
  | 'isActualize';

export interface ProductType {
  id?: number;
  title: string;
  price: { zł: { [key: string]: number }; '€': { [key: string]: number } };
  img: string;
  weight: number[];
  description?: string;
  totalWeightProduct: number;
  isEnable: boolean;
  category: number;
  totalProductWeightFromProducts: { [title: string]: number };
}

export interface UserDataTypes {
  uniqueId: string;
  phoneNumber: string;
  isFirstTimeBuy: boolean;
  ordersCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export type CartItem = {
  title: string;
  imageUrl: string;
  price: number;
  weight: number;
  id: string | string;
  count: number;
  activePrice: ActualPriceType;
  activeCountry: string;
};

export interface FormData {
  data: UserDataTypes;
  totalPrice: string;
  totalWeight: string;
  activePrice: string;
  rightCurrentCountry: string;
  rightShipPrice: number;
  isCatExist: string;
  freeDelivery: string;
  catPic?: Express.Multer.File;
  products: string; // Assuming OrderItem is another type/interface
  userFromWeb: string; // Assuming UserType is another type/interface
  chatId: string;
}
