"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import MainArea from "./components/main-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DeckInfoModal from "./components/deck-info-modal";

// Mock data for categories and decks
const initialCategories = [
  {
    id: "1",
    name: "Programming",
    decks: [
      { id: "1-1", name: "JavaScript", selected: false, cardCount: 25 },
      { id: "1-2", name: "Python", selected: false, cardCount: 18 },
      { id: "1-3", name: "React", selected: false, cardCount: 30 },
    ],
  },
  {
    id: "2",
    name: "Languages",
    decks: [
      { id: "2-1", name: "Spanish", selected: false, cardCount: 40 },
      { id: "2-2", name: "French", selected: false, cardCount: 35 },
    ],
  },
  {
    id: "3",
    name: "Science",
    decks: [
      { id: "3-1", name: "Physics", selected: false, cardCount: 22 },
      { id: "3-2", name: "Chemistry", selected: false, cardCount: 28 },
    ],
  },
];

export default function Page() {
  const [selectedDecks, setSelectedDecks] = useState<
    { deckId: string; cardCount: number }[]
  >([]);
  const [categories, setCategories] = useState(initialCategories);

  // State for DeckInfoModal
  const [isDeckInfoModalOpen, setIsDeckInfoModalOpen] = useState(false);
  const [selectedDeckInfo, setSelectedDeckInfo] = useState<{
    deckId: string;
    deckName: string;
    categoryName: string;
  } | null>(null);

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
            onDeleteCard={() => {}} // TODO: Implement these handlers
            onUpdateCard={() => {}}
            onAddCard={() => {}}
          />
        )}
      </SidebarProvider>
    </div>
  );
}
