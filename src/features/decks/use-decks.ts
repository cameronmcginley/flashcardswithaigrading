import { useState, useEffect } from "react";
import { getDecks } from "./deck";

export function useDecks() {
  const [data, setData] = useState<Array<{ id: string; name: string }> | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const decks = await getDecks();
        setData(decks);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch decks")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDecks();
  }, []);

  return { data, error, isLoading };
}
