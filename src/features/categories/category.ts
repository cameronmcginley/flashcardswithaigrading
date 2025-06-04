import { supabase } from "@/lib/supabase/client";
import { isValidCategoryName } from "./utils";
import { INVALID_CATEGORY_NAME_ERROR } from "./constants";
import { updateDeckOrder } from "../decks/deck";

export const getAllCategoriesWithDecks = async () => {
  const { data: rawData, error } = await supabase
    .from("categories")
    .select(
      `
      id,
      name,
      display_order,
      decks:decks!left (
        id,
        name,
        display_order,
        cards!left (
          count
        )
      )
    `
    )
    .is("deleted_at", null)
    .is("decks.deleted_at", null)
    .is("decks.cards.deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) throw error;

  // Transform the nested structure into the expected format
  const data = rawData?.map((category) => ({
    id: category.id,
    name: category.name,
    decks: (category.decks || [])
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((deck) => ({
        id: deck.id,
        name: deck.name,
        card_count: deck.cards?.[0]?.count || 0,
      })),
  }));

  return data;
};

export const getCategoryById = async (categoryId: string) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (error) throw error;
  return data;
};

export const createCategory = async (name: string) => {
  if (!name) {
    throw new Error("Missing required fields");
  }

  if (!isValidCategoryName(name)) {
    throw new Error(INVALID_CATEGORY_NAME_ERROR);
  }

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (categoryId: string, name: string) => {
  if (!categoryId || !name) {
    throw new Error("Missing required fields");
  }

  if (!isValidCategoryName(name)) {
    throw new Error(INVALID_CATEGORY_NAME_ERROR);
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (categoryId: string) => {
  if (!categoryId) {
    throw new Error("Missing required fields");
  }

  // Check if the category has any decks associated with it
  const { data: decks, error: decksError } = await supabase
    .from("decks")
    .select("*")
    .eq("category_id", categoryId);

  if (decksError) throw decksError;
  if (decks.length > 0) {
    throw new Error("Cannot delete category with associated decks");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date() })
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCategoryOrder = async (
  categoryId: string,
  newOrder: number
) => {
  if (!categoryId) {
    throw new Error("Missing required fields");
  }

  const { error } = await supabase.rpc("update_category_order", {
    category_id: categoryId,
    new_order: newOrder,
  });

  if (error) throw error;
  return true;
};

export interface OrderUpdateItem {
  id: string;
  type: "category" | "deck";
  order: number;
}

export const updateItemsOrder = async (items: OrderUpdateItem[]) => {
  const categoryUpdates = items
    .filter((item) => item.type === "category")
    .map((item) => updateCategoryOrder(item.id, item.order));

  const deckUpdates = items
    .filter((item) => item.type === "deck")
    .map((item) => updateDeckOrder(item.id, item.order));

  await Promise.all([...categoryUpdates, ...deckUpdates]);
  return true;
};
