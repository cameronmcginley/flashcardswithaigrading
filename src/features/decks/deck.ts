import { supabase } from "@/lib/supabase/client";

export const getDecks = async () => {
  const { data, error } = await supabase.from("decks").select("*");
  if (error) throw error;
  return data;
};
