export interface OrderType {
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
export type UserOrderStatus = 'isConfirmationOrderSended' | 'isConfirmationPaymentSended' | 'isPacNumberSended' | 'isActualize';
export interface ProductType {
    id: number;
    title: string;
    price: {
        zł: number[];
        '€': number[];
    };
    img: string;
    weight: number[];
    description?: string;
    totalWeightProduct: number;
    isEnable: boolean;
    category: number;
    totalProductWeightFromProducts: {
        [id: number]: number;
    };
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
    products: CartItem[];
    userFromWeb: string;
    chatId: number;
}
