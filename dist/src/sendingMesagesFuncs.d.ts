import TelegramBot from 'node-telegram-bot-api';
interface SendingMessageTypes {
    chatId: number;
    userId: number;
    text: string;
    messageId: number;
    keyboards: TelegramBot.InlineKeyboardButton[][];
}
type SendingMessageTypeWithOrderNuymber = SendingMessageTypes & {
    orderNumberFromText: string;
};
export declare function SM_confrimOrder({ chatId, userId, text, messageId, keyboards, }: SendingMessageTypes): void;
export declare function SM_sendPaymentMessage(chatId: number, type: string): void;
export declare function SM_requestUserPhoto(chat_id: number): void;
export declare function SM_paymentConfirm({ chatId, userId, text, messageId, keyboards, }: SendingMessageTypes): void;
export declare function SM_userDeclineOrder({ chatId, group_id, messageId_group, messageId, orderNumberFromText, }: {
    bot: TelegramBot;
    chatId: number;
    group_id: string;
    messageId_group: number;
    messageId: number;
    orderNumberFromText: string;
}): void;
export declare function SM_userAcceptOrder(bot: TelegramBot, groupId: string, orderNumberFromText: string): void;
export declare function SM_actualizeInfo({ chatId, keyboards, userId, messageId, text, orderNumberFromText, }: SendingMessageTypeWithOrderNuymber): void;
export declare function SM_sendOrderConfirmation({ chatId, keyboards, userId, messageId, text, orderNumberFromText, }: SendingMessageTypeWithOrderNuymber): void;
export {};
