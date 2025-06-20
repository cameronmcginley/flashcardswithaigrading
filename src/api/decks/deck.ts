import { logAction } from "src/lib/log";
import { supabase } from "@/lib/supabase/client";
import { isValidDeckName } from "./utils";
import { INVALID_DECK_NAME_ERROR } from "./constants";

export const getDecks = async () => {
  const { data, error } = await supabase.from("decks").select("*");
  if (error) throw error;
  return data;
};

export const getDeckById = async (deckId: string) => {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", deckId)
    .single();

  if (error) throw error;
  return data;
};

export const createDeck = async (name: string, categoryId: string) => {
  if (!name || !categoryId) {
    throw new Error("Missing required fields");
  }

  if (!isValidDeckName(name)) {
    throw new Error(INVALID_DECK_NAME_ERROR);
  }

  // Get the current user's ID
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("decks")
    .insert([
      {
        name,
        category_id: categoryId,
        profile_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  logAction({
    event: "Deck Created",
    tags: { name: name, category_id: categoryId },
  });

  return data;
};

export const updateDeck = async (deckId: string, name: string) => {
  if (!deckId || !name) {
    throw new Error("Missing required fields");
  }

  if (!isValidDeckName(name)) {
    throw new Error(INVALID_DECK_NAME_ERROR);
  }

  const { data, error } = await supabase
    .from("decks")
    .update({ name })
    .eq("id", deckId)
    .select()
    .single();

  if (error) throw error;

  logAction({
    event: "Deck Updated",
    tags: { deck_id: deckId, new_name: name },
  });

  return data;
};

export const deleteDeck = async (deckId: string) => {
  if (!deckId) {
    throw new Error("Missing required fields");
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase.rpc("delete_deck_with_contents", {
    deck_id: deckId,
    deletion_time: now,
  });

  if (error) throw error;

  logAction({
    event: "Deck Deleted",
    tags: { deck_id: deckId },
  });

  return data;
};

export const updateDeckOrder = async (deckId: string, newOrder: number) => {
  if (!deckId) {
    throw new Error("Missing required fields");
  }

  const { error } = await supabase.rpc("update_deck_order", {
    deck_id: deckId,
    new_order: newOrder,
  });

  if (error) throw error;

  logAction({
    event: "Deck Order Updated",
    tags: { deck_id: deckId, new_order: newOrder },
  });

  return true;
};
