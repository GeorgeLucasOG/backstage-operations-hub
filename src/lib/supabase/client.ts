
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { DATABASE_CONFIG } from '@/config/database';

// Cliente Supabase configurado
export const supabase = createClient<Database>(DATABASE_CONFIG.url, DATABASE_CONFIG.key);

// ID padrão do restaurante para usar em toda a aplicação
export const DEFAULT_RESTAURANT_ID = "d2d5278d-8df1-4819-87a0-f23b519e3f2a";

// Funções auxiliares para operações comuns
export const supabaseHelpers = {
  // Buscar todos os restaurantes
  async getRestaurants() {
    const { data, error } = await supabase
      .from('Restaurant')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Buscar produtos
  async getProducts() {
    const { data, error } = await supabase
      .from('Product')
      .select('*, MenuCategory(*)')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Buscar categorias
  async getCategories() {
    const { data, error } = await supabase
      .from('MenuCategory')
      .select('*, Restaurant(name)')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Buscar pedidos
  async getOrders() {
    const { data, error } = await supabase
      .from('Order')
      .select('*, OrderProduct(*, Product(*))')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Buscar contas a receber
  async getAccountsReceivable() {
    const { data, error } = await supabase
      .from('AccountsReceivable')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Buscar contas a pagar
  async getAccountsPayable() {
    const { data, error } = await supabase
      .from('AccountsPayable')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
