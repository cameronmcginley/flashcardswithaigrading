import { supabase } from "@/lib/supabase";

export const getDecks = async () => {
  const { data, error } = await supabase.from("decks").select("*");
  if (error) throw error;
  return data;
};
