import { PrismaClient, Prisma } from "@prisma/client";

// Declaração do tipo global para o PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Verifica se estamos no lado do cliente ou do servidor
const isClient = typeof window !== "undefined";

// Se estamos no navegador, criamos uma versão simulada do PrismaClient
// para evitar erros, já que o PrismaClient não deve ser executado no cliente
const dummyPrismaClient = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $on: () => {},
  $transaction: <T>(cb: (prisma: PrismaClient) => Promise<T>) =>
    Promise.resolve({} as T),
  $queryRaw: () => Promise.resolve([]),
  restaurant: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: (data: { data: Prisma.RestaurantCreateInput }) =>
      Promise.resolve(data.data),
    update: (data: { data: Prisma.RestaurantUpdateInput }) =>
      Promise.resolve(data.data),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  // Adicione outros modelos conforme necessário
} as unknown as PrismaClient;

// Criação do cliente Prisma com log em ambiente de desenvolvimento
export const prisma = isClient
  ? dummyPrismaClient
  : global.prisma ||
    new PrismaClient({
      log: import.meta.env.DEV ? ["query", "error", "warn"] : ["error"],
    });

// Em ambiente de desenvolvimento e no servidor, salvamos a instância no objeto global
if (!isClient && import.meta.env.DEV) {
  global.prisma = prisma;
}
