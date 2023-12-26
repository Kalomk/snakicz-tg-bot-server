declare const createOrFindExistUser: ({ uniqueId, phoneNumber, }: {
    uniqueId: string;
    phoneNumber: string;
}) => Promise<{
    id: number;
    uniqueId: string;
    phoneNumber: string;
    isFirstTimeBuy: boolean;
    ordersCount: number;
    createdAt: Date;
    updatedAt: Date;
} | undefined>;
declare const getAllUsers: () => import(".prisma/client").Prisma.PrismaPromise<{
    id: number;
    uniqueId: string;
    phoneNumber: string;
    isFirstTimeBuy: boolean;
    ordersCount: number;
    createdAt: Date;
    updatedAt: Date;
}[]> | never[];
declare const userDelete: (uniqueId: string) => import(".prisma/client").Prisma.Prisma__UserClient<{
    id: number;
    uniqueId: string;
    phoneNumber: string;
    isFirstTimeBuy: boolean;
    ordersCount: number;
    createdAt: Date;
    updatedAt: Date;
}, never, import("@prisma/client/runtime/library").DefaultArgs> | never[];
export { createOrFindExistUser, getAllUsers, userDelete };
