
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SUPABASE_CONFIG } from '@/config/supabase';

// Cliente Supabase configurado
export const supabase = createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// ID padrão do restaurante para usar em toda a aplicação
export const DEFAULT_RESTAURANT_ID = "d2d5278d-8df1-4819-87a0-f23b519e3f2a";

// Funções auxiliares para operações comuns
export const supabaseHelpers = {
  // Buscar todos os restaurantes
  async getRestaurants() {
    console.log('Fetching restaurants...');
    const { data, error } = await supabase
      .from('Restaurant')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
    console.log('Restaurants fetched:', data);
    return data;
  },

  // Buscar produtos
  async getProducts() {
    console.log('Fetching products...');
    const { data, error } = await supabase
      .from('Product')
      .select('*, MenuCategory(name), Restaurant(name)')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    console.log('Products fetched:', data);
    return data;
  },

  // Buscar categorias
  async getCategories() {
    console.log('Fetching categories...');
    const { data, error } = await supabase
      .from('MenuCategory')
      .select('*, Restaurant(name)')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    console.log('Categories fetched:', data);
    return data;
  },

  // Buscar pedidos
  async getOrders() {
    console.log('Fetching orders...');
    const { data, error } = await supabase
      .from('Order')
      .select('*, OrderProduct(*, Product(name, price)), Restaurant(name)')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    console.log('Orders fetched:', data);
    return data;
  },

  // Buscar contas a receber
  async getAccountsReceivable() {
    console.log('Fetching accounts receivable...');
    const { data, error } = await supabase
      .from('AccountsReceivable')
      .select('*, Restaurant(name)')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching accounts receivable:', error);
      throw error;
    }
    console.log('Accounts receivable fetched:', data);
    return data;
  },

  // Buscar contas a pagar
  async getAccountsPayable() {
    console.log('Fetching accounts payable...');
    const { data, error } = await supabase
      .from('AccountsPayable')
      .select('*, Restaurant(name)')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching accounts payable:', error);
      throw error;
    }
    console.log('Accounts payable fetched:', data);
    return data;
  }
};
