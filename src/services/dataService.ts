import { useAuth } from "@/hooks/useAuth";

// Tipos básicos para modelagem de dados
interface BaseEntity {
  id: string;
  businessId: string; // ID do negócio ao qual o dado pertence
  createdAt: string;
  updatedAt: string;
}

// Interface para produtos
export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  isAvailable: boolean;
}

// Interface para itens do cardápio
export interface MenuItem extends BaseEntity {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  isAvailable: boolean;
}

// Interface para pedidos
export interface Order extends BaseEntity {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
}

// Interface para itens de pedido
export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Hook para operações de dados com segurança por negócio
 * Todas as operações realizadas através deste serviço automaticamente
 * aplicam filtros de segurança baseados no negócio do usuário atual
 */
export const useDataService = () => {
  const { user } = useAuth();

  // Verificar se o usuário está autenticado e tem um negócio associado
  const validateBusinessAccess = () => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    if (!user.businessName || !user.id) {
      throw new Error("Usuário sem negócio associado");
    }

    return user.id; // Usaremos o ID do usuário como ID do negócio para simplicidade
  };

  /**
   * OPERAÇÕES GENÉRICAS PARA QUALQUER ENTIDADE
   */

  // Função genérica para criar entidades com segurança
  const create = async <T extends Partial<BaseEntity>>(
    collectionName: string,
    data: Omit<T, "id" | "businessId" | "createdAt" | "updatedAt">
  ): Promise<T> => {
    const businessId = validateBusinessAccess();

    // Cria a entidade com o ID do negócio atual
    const newEntity = {
      ...data,
      id: Date.now().toString(), // Gera um ID único
      businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    // Em uma aplicação real, aqui seria feita uma chamada à API
    // Para simplificar, guardamos no localStorage
    const storageKey = `${collectionName}_${businessId}`;
    const existingData = localStorage.getItem(storageKey);
    const collection = existingData ? JSON.parse(existingData) : [];
    collection.push(newEntity);
    localStorage.setItem(storageKey, JSON.stringify(collection));

    return newEntity;
  };

  // Função genérica para obter todas as entidades de um tipo com segurança
  const getAll = async <T extends BaseEntity>(
    collectionName: string
  ): Promise<T[]> => {
    const businessId = validateBusinessAccess();

    // Busca apenas dados associados ao negócio atual
    const storageKey = `${collectionName}_${businessId}`;
    const existingData = localStorage.getItem(storageKey);

    if (!existingData) {
      return [];
    }

    return JSON.parse(existingData) as T[];
  };

  // Função genérica para obter uma entidade por ID com segurança
  const getById = async <T extends BaseEntity>(
    collectionName: string,
    id: string
  ): Promise<T | null> => {
    const businessId = validateBusinessAccess();

    // Busca apenas dados associados ao negócio atual
    const storageKey = `${collectionName}_${businessId}`;
    const existingData = localStorage.getItem(storageKey);

    if (!existingData) {
      return null;
    }

    const collection = JSON.parse(existingData) as T[];
    return (
      collection.find(
        (item) => item.id === id && item.businessId === businessId
      ) || null
    );
  };

  // Função genérica para atualizar uma entidade com segurança
  const update = async <T extends BaseEntity>(
    collectionName: string,
    id: string,
    data: Partial<Omit<T, "id" | "businessId" | "createdAt" | "updatedAt">>
  ): Promise<T | null> => {
    const businessId = validateBusinessAccess();

    // Busca apenas dados associados ao negócio atual
    const storageKey = `${collectionName}_${businessId}`;
    const existingData = localStorage.getItem(storageKey);

    if (!existingData) {
      return null;
    }

    const collection = JSON.parse(existingData) as T[];

    // Encontra a entidade a ser atualizada e verifica se pertence ao negócio atual
    const entityIndex = collection.findIndex(
      (item) => item.id === id && item.businessId === businessId
    );

    if (entityIndex === -1) {
      return null; // Entidade não encontrada ou não pertence ao negócio atual
    }

    // Atualiza a entidade
    const updatedEntity = {
      ...collection[entityIndex],
      ...data,
      businessId, // Garante que o businessId não seja alterado
      updatedAt: new Date().toISOString(),
    } as T;

    collection[entityIndex] = updatedEntity;
    localStorage.setItem(storageKey, JSON.stringify(collection));

    return updatedEntity;
  };

  // Função genérica para excluir uma entidade com segurança
  const remove = async <T extends BaseEntity>(
    collectionName: string,
    id: string
  ): Promise<boolean> => {
    const businessId = validateBusinessAccess();

    // Busca apenas dados associados ao negócio atual
    const storageKey = `${collectionName}_${businessId}`;
    const existingData = localStorage.getItem(storageKey);

    if (!existingData) {
      return false;
    }

    const collection = JSON.parse(existingData) as T[];

    // Encontra a entidade a ser excluída e verifica se pertence ao negócio atual
    const entityIndex = collection.findIndex(
      (item) => item.id === id && item.businessId === businessId
    );

    if (entityIndex === -1) {
      return false; // Entidade não encontrada ou não pertence ao negócio atual
    }

    // Remove a entidade
    collection.splice(entityIndex, 1);
    localStorage.setItem(storageKey, JSON.stringify(collection));

    return true;
  };

  /**
   * OPERAÇÕES ESPECÍFICAS PARA PRODUTOS
   */
  const products = {
    create: (
      data: Omit<Product, "id" | "businessId" | "createdAt" | "updatedAt">
    ) => create<Product>("products", data),
    getAll: () => getAll<Product>("products"),
    getById: (id: string) => getById<Product>("products", id),
    update: (
      id: string,
      data: Partial<
        Omit<Product, "id" | "businessId" | "createdAt" | "updatedAt">
      >
    ) => update<Product>("products", id, data),
    remove: (id: string) => remove<Product>("products", id),
  };

  /**
   * OPERAÇÕES ESPECÍFICAS PARA ITENS DO CARDÁPIO
   */
  const menuItems = {
    create: (
      data: Omit<MenuItem, "id" | "businessId" | "createdAt" | "updatedAt">
    ) => create<MenuItem>("menuItems", data),
    getAll: () => getAll<MenuItem>("menuItems"),
    getById: (id: string) => getById<MenuItem>("menuItems", id),
    update: (
      id: string,
      data: Partial<
        Omit<MenuItem, "id" | "businessId" | "createdAt" | "updatedAt">
      >
    ) => update<MenuItem>("menuItems", id, data),
    remove: (id: string) => remove<MenuItem>("menuItems", id),
  };

  /**
   * OPERAÇÕES ESPECÍFICAS PARA PEDIDOS
   */
  const orders = {
    create: (
      data: Omit<Order, "id" | "businessId" | "createdAt" | "updatedAt">
    ) => create<Order>("orders", data),
    getAll: () => getAll<Order>("orders"),
    getById: (id: string) => getById<Order>("orders", id),
    update: (
      id: string,
      data: Partial<
        Omit<Order, "id" | "businessId" | "createdAt" | "updatedAt">
      >
    ) => update<Order>("orders", id, data),
    remove: (id: string) => remove<Order>("orders", id),

    // Métodos específicos para pedidos
    getByStatus: async (status: Order["status"]): Promise<Order[]> => {
      const allOrders = await getAll<Order>("orders");
      return allOrders.filter((order) => order.status === status);
    },

    updateStatus: async (
      id: string,
      status: Order["status"]
    ): Promise<Order | null> => {
      return update<Order>("orders", id, { status });
    },
  };

  // Retorna todas as operações
  return {
    // Operações genéricas
    create,
    getAll,
    getById,
    update,
    remove,

    // Operações específicas por entidade
    products,
    menuItems,
    orders,

    // Acesso ao ID do negócio atual
    getCurrentBusinessId: validateBusinessAccess,
  };
};

// Exportação de funções de utilidade para trabalhar com dados
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
