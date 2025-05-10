import { supabase } from "@/lib/supabase";

export async function getDecks() {
  const { data, error } = await supabase.from("decks").select("*");
  if (error) throw error;
  return data;
}
