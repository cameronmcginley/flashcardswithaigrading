import { supabase } from "@/lib/supabase";
import { isValidCategoryName } from "./utils";
import { INVALID_CATEGORY_NAME_ERROR } from "./constants";

export const getAllCategoriesWithDecks = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*, decks(*)")
    .order("name", { ascending: true });

  if (error) throw error;
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
