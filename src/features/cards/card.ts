import { supabase } from "@/lib/supabase";
import { INVALID_CARD_FRONT_AND_BACK_ERROR } from "./constants";
import { isValidCardFrontAndBack } from "./utils";

/** Fetch a single card by its ID */
export const getCard = async (cardId: string) => {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (error) throw error;
  return data;
};

/** Create a new card */
export const createCard = async (
  deckId: string,
  front: string,
  back: string
) => {
  if (!deckId || !front || !back) {
    throw new Error("Missing required fields");
  }

  if (!isValidCardFrontAndBack(front, back)) {
    throw new Error(INVALID_CARD_FRONT_AND_BACK_ERROR);
  }

  const { data, error } = await supabase
    .from("cards")
    .insert([{ deck_id: deckId, front, back }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/** Create many cards */
export const createManyCards = async (
  deckId: string,
  cards: { front: string; back: string }[]
) => {
  if (!deckId || !cards || cards.length === 0) {
    throw new Error("Missing required fields");
  }

  for (const card of cards) {
    if (!isValidCardFrontAndBack(card.front, card.back)) {
      throw new Error(INVALID_CARD_FRONT_AND_BACK_ERROR);
    }
  }

  const { data, error } = await supabase
    .from("cards")
    .insert(cards.map((card) => ({ ...card, deck_id: deckId })))
    .select();

  if (error) throw error;
  return data;
};

/** Update the front and/or back fields of a card */
export const updateCardFrontAndOrBack = async (
  cardId: string,
  front?: string,
  back?: string
) => {
  if (!front && !back) {
    throw new Error("No fields to update");
  }

  if (!isValidCardFrontAndBack(front, back)) {
    throw new Error(INVALID_CARD_FRONT_AND_BACK_ERROR);
  }

  const updates: { front?: string; back?: string } = {};
  if (front) updates.front = front;
  if (back) updates.back = back;

  const { data, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", cardId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/** Soft-delete a card */
export const deleteCard = async (cardId: string) => {
  const { data, error } = await supabase
    .from("cards")
    .update({ deleted_at: new Date() })
    .eq("id", cardId)
    .select();

  if (error) throw error;
  return data;
};

/** Soft-delete all cards in a deck */
export const deleteAllCardsInDeck = async (deckId: string) => {
  const { data, error } = await supabase
    .from("cards")
    .update({ deleted_at: new Date() })
    .eq("deck_id", deckId)
    .select();
  if (error) throw error;
  return data;
};

/** Restore  soft-deleted cards */
export const restoreCards = async (cardIds: string[]) => {
  if (!cardIds || cardIds.length === 0) {
    throw new Error("No card IDs provided");
  }

  const { data, error } = await supabase
    .from("cards")
    .update({ deleted_at: null })
    .in("id", cardIds)
    .select();
  if (error) throw error;
  return data;
};

/**
 * Currently, bulk editing deletes all cards and re-inserts the new set
 *
 * TODO: Avoid this by trying to match the new cards with existing ones
 * and only update the ones that are different or add new ones
 * */
export const bulkEditDeckCards = async (
  deckId: string,
  cards: { front: string; back: string }[]
) => {
  if (!deckId || !cards || cards.length === 0) {
    throw new Error("Missing required fields");
  }

  for (const card of cards) {
    if (!isValidCardFrontAndBack(card.front, card.back)) {
      throw new Error(INVALID_CARD_FRONT_AND_BACK_ERROR);
    }
  }

  const deletedCards = await deleteAllCardsInDeck(deckId);

  try {
    const insertedCards = await createManyCards(deckId, cards);
    return insertedCards;
  } catch {
    const deletedCardIds = deletedCards.map((card) => card.id);
    await restoreCards(deletedCardIds);
    throw new Error("Insert failed, rollback attempted");
  }
};

/** Get all cards in a specific deck */
export const getAllCardsInDeck = async (deckId: string) => {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("deck_id", deckId)
    .is("deleted_at", null);

  if (error) throw error;
  return data;
};

/** Get all cards belonging to decks in a given category */
export const getAllCardsInCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from("cards")
    .select("*, deck!inner(category_id)")
    .eq("deck.category_id", categoryId)
    .is("deleted_at", null);

  if (error) throw error;
  return data;
};

/** Mark a card as answered correctly and update ease/stats */
export const markCardCorrect = async (cardId: string) => {
  const { data, error } = await supabase
    .from("cards")
    .select("ease, review_count, correct_count")
    .eq("id", cardId)
    .single();

  if (error) throw error;

  const updated = {
    ease: Math.min(5.0, (data.ease ?? 2.5) + 0.15),
    review_count: (data.review_count ?? 0) + 1,
    correct_count: (data.correct_count ?? 0) + 1,
    last_reviewed: new Date(),
  };

  const { data: updatedCard, error: updateError } = await supabase
    .from("cards")
    .update(updated)
    .eq("id", cardId)
    .select()
    .single();

  if (updateError) throw updateError;
  return updatedCard;
};

/** Mark a card as answered incorrectly and update ease/stats */
export const markCardIncorrect = async (cardId: string) => {
  const { data, error } = await supabase
    .from("cards")
    .select("ease, review_count, incorrect_count")
    .eq("id", cardId)
    .single();

  if (error) throw error;

  const updated = {
    ease: Math.max(1.3, (data.ease ?? 2.5) - 0.2),
    review_count: (data.review_count ?? 0) + 1,
    incorrect_count: (data.incorrect_count ?? 0) + 1,
    last_reviewed: new Date(),
  };

  const { data: updatedCard, error: updateError } = await supabase
    .from("cards")
    .update(updated)
    .eq("id", cardId)
    .select()
    .single();

  if (updateError) throw updateError;
  return updatedCard;
};
