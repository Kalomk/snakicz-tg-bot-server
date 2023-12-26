import TelegramBot from 'node-telegram-bot-api';
export declare function EH_contactHandler(msg: TelegramBot.Message): Promise<void>;
export declare function EH_onCallbackQuery(callbackQuery: TelegramBot.CallbackQuery, group_id: string): Promise<void>;
