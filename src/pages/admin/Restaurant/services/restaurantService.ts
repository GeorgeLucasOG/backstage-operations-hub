import { supabase } from "@/integrations/supabase/client";

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  avatarImageUrl?: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from("Restaurant")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching restaurants:", error);
    throw new Error("Failed to load restaurants");
  }

  return data || [];
};

export const fetchRestaurantById = async (
  id: string
): Promise<Restaurant | null> => {
  const { data, error } = await supabase
    .from("Restaurant")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }

  return data;
};
