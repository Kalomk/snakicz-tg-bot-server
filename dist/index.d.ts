import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';
export declare const group_chat: string;
export declare const group_chat_for_payment: string;
export declare const webAppUrl: string;
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const bot: TelegramBot;
