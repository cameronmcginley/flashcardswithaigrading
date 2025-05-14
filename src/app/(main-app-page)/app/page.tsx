"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import MainArea from "./components/main-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DeckInfoModal from "./components/deck-info-modal";
import { getAllCategoriesWithDecks } from "@/features/categories/category";
import { toast } from "sonner";

// Define interfaces that match the database schema
interface DatabaseDeck {
  id: string;
  name: string;
  card_count: number;
}

interface DatabaseCategory {
  id: string;
  name: string;
  decks: DatabaseDeck[];
}

// Define interfaces for the UI components
interface UIDeck {
  id: string;
  name: string;
  selected: boolean;
  cardCount: number;
}

interface UICategory {
  id: string;
  name: string;
  decks: UIDeck[];
}

export default function Page() {
  const [selectedDecks, setSelectedDecks] = useState<
    { deckId: string; cardCount: number }[]
  >([]);
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for DeckInfoModal
  const [isDeckInfoModalOpen, setIsDeckInfoModalOpen] = useState(false);
  const [selectedDeckInfo, setSelectedDeckInfo] = useState<{
    deckId: string;
    deckName: string;
    categoryName: string;
  } | null>(null);

  // Fetch categories and decks on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCategoriesWithDecks();

        // Transform the data to match our UI interface
        const transformedCategories: UICategory[] = data.map(
          (category: DatabaseCategory) => ({
            id: category.id,
            name: category.name,
            decks: category.decks.map((deck: DatabaseDeck) => ({
              id: deck.id,
              name: deck.name,
              selected: false,
              cardCount: deck.card_count || 0,
            })),
          })
        );

        setCategories(transformedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories and decks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectedDecksChange = (categoryId: string, deckId: string) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          decks: category.decks.map((deck) => {
            if (deck.id === deckId) {
              return { ...deck, selected: !deck.selected };
            }
            return deck;
          }),
        };
      }
      return category;
    });

    setCategories(updatedCategories);

    // Update selected decks
    const selectedDecks = updatedCategories.flatMap((category) =>
      category.decks
        .filter((deck) => deck.selected)
        .map((deck) => ({ deckId: deck.id, cardCount: deck.cardCount }))
    );
    setSelectedDecks(selectedDecks);
  };

  const handleAddDeck = (categoryId: string) => {
    // TODO: Implement add deck functionality
    console.log("Add deck to category:", categoryId);
  };

  const handleAddCategory = () => {
    // TODO: Implement add category functionality
    console.log("Add category");
  };

  const handleEditDeck = (
    deckId: string,
    deckName: string,
    categoryName: string
  ) => {
    setSelectedDeckInfo({ deckId, deckName, categoryName });
    setIsDeckInfoModalOpen(true);
  };

  const handleDeleteDeck = (categoryId: string, deckId: string) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          decks: category.decks.filter((deck) => deck.id !== deckId),
        };
      }
      return category;
    });
    setCategories(updatedCategories);
  };

  const handleUpdateDeckName = (newName: string) => {
    if (!selectedDeckInfo) return;

    const updatedCategories = categories.map((category) => ({
      ...category,
      decks: category.decks.map((deck) =>
        deck.id === selectedDeckInfo.deckId ? { ...deck, name: newName } : deck
      ),
    }));
    setCategories(updatedCategories);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <SidebarProvider
        className="flex-1 flex"
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          categories={categories}
          onDeckSelect={handleSelectedDecksChange}
          onAddDeck={handleAddDeck}
          onAddCategory={handleAddCategory}
          onEditDeck={handleEditDeck}
          onDeleteDeck={handleDeleteDeck}
        />
        <SidebarInset className="flex flex-col pt-0">
          <header className="flex h-12 shrink-0 items-center gap-3 px-4">
            <SidebarTrigger className="-ml-1" />
            <span className="text-sm text-muted-foreground">
              {selectedDecks.length === 0
                ? "No decks selected"
                : `${selectedDecks.length} deck${
                    selectedDecks.length === 1 ? "" : "s"
                  } selected`}
            </span>
          </header>
          <div className="flex-1 overflow-auto p-4 pt-0">
            <MainArea selectedDecks={selectedDecks} />
          </div>
        </SidebarInset>

        {selectedDeckInfo && (
          <DeckInfoModal
            open={isDeckInfoModalOpen}
            onOpenChange={setIsDeckInfoModalOpen}
            deckId={selectedDeckInfo.deckId}
            deckName={selectedDeckInfo.deckName}
            categoryName={selectedDeckInfo.categoryName}
            onUpdateDeckName={handleUpdateDeckName}
            onDeleteCard={() => {}}
            onUpdateCard={() => {}}
            onAddCard={() => {}}
          />
        )}
      </SidebarProvider>
    </div>
  );
}
