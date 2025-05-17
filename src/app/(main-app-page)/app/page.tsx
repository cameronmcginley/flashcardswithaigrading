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
import AddCardModal from "./components/add-card-modal";
import AddDeckModal from "./components/add-deck-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  // State for AddCardModal
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [selectedDeckForCard, setSelectedDeckForCard] = useState<{
    deckId: string;
    deckName: string;
    categoryName: string;
  } | null>(null);

  // Add state for add category modal
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Add state for add deck modal from FAB
  const [isAddDeckFromFabModalOpen, setIsAddDeckFromFabModalOpen] =
    useState(false);
  const [selectedCategoryIdForDeck, setSelectedCategoryIdForDeck] = useState<
    string | null
  >(null);

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
    setIsAddCategoryModalOpen(true);
  };

  const handleAddCategorySubmit = () => {
    if (newCategoryName.trim()) {
      // TODO: Implement actual save to database
      const newCategory: UICategory = {
        id: `cat-${Date.now()}`,
        name: newCategoryName,
        decks: [],
      };

      setCategories([...categories, newCategory]);
      toast.success(`Category "${newCategoryName}" added`);
      setNewCategoryName("");
      setIsAddCategoryModalOpen(false);
    }
  };

  const handleEditDeck = (
    deckId: string,
    deckName: string,
    categoryName: string
  ) => {
    setSelectedDeckInfo({ deckId, deckName, categoryName });
    setIsDeckInfoModalOpen(true);
  };

  const handleAddCard = (
    deckId: string,
    deckName: string,
    categoryName: string
  ) => {
    setSelectedDeckForCard({ deckId, deckName, categoryName });
    setIsAddCardModalOpen(true);
  };

  const handleCardCountChange = (deckId: string, change: number) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        decks: category.decks.map((deck) =>
          deck.id === deckId
            ? { ...deck, cardCount: deck.cardCount + change }
            : deck
        ),
      }))
    );
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

  const handleAddCardSubmit = (front: string, back: string, deckId: string) => {
    // TODO: Add actual implementation to save the card to the database
    console.log("Adding card to deck:", deckId, { front, back });

    // Increment the card count for the deck
    handleCardCountChange(deckId, 1);

    toast.success("Card added successfully");
  };

  const handleAddMultipleCards = (
    cards: Array<{ front: string; back: string }>,
    deckId: string
  ) => {
    // TODO: Add actual implementation to save multiple cards
    console.log("Adding multiple cards to deck:", deckId, cards);

    // Increment the card count for the deck
    handleCardCountChange(deckId, cards.length);

    toast.success(`Added ${cards.length} cards successfully`);
  };

  const handleAddCardGeneral = () => {
    // Get all available decks
    const allDecks = categories.flatMap((category) =>
      category.decks.map((deck) => ({
        deckId: deck.id,
        deckName: deck.name,
        categoryName: category.name,
      }))
    );

    // Select the first deck by default if any exists
    if (allDecks.length > 0) {
      const firstDeck = allDecks[0];
      setSelectedDeckForCard({
        deckId: firstDeck.deckId,
        deckName: firstDeck.deckName,
        categoryName: firstDeck.categoryName,
      });
      setIsAddCardModalOpen(true);
    } else {
      toast.error("No decks available. Please create a deck first.");
    }
  };

  // Render the Add Category modal content only when needed
  const renderAddCategoryModal = () => (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Category</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="categoryName" className="text-right">
            Name
          </Label>
          <Input
            id="categoryName"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="col-span-3"
            autoFocus
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setIsAddCategoryModalOpen(false)}
        >
          Cancel
        </Button>
        <Button onClick={handleAddCategorySubmit}>Add Category</Button>
      </DialogFooter>
    </DialogContent>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Prerender dialog without content for faster initial render */}
      <Dialog
        open={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
      >
        {isAddCategoryModalOpen && renderAddCategoryModal()}
      </Dialog>

      <SidebarProvider
        className="flex-1 flex"
        style={
          {
            "--sidebar-width": "clamp(22rem, 20vw, 30rem)",
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
          onAddCard={handleAddCard}
          onAddCardGeneral={handleAddCardGeneral}
        />
        <SidebarInset className="flex flex-col pt-0">
          <header className="flex h-12 shrink-0 items-center gap-3 px-4">
            <SidebarTrigger className="-ml-1" />
            <span className="text-sm text-muted-foreground">
              {selectedDecks.length === 0
                ? "No decks selected"
                : `${selectedDecks.length} deck${
                    selectedDecks.length === 1 ? "" : "s"
                  } selected${(() => {
                    // Check if debug mode is enabled in localStorage
                    const savedSettings =
                      localStorage.getItem("ez-anki-settings");
                    let debugMode = false;
                    if (savedSettings) {
                      try {
                        const settings = JSON.parse(savedSettings);
                        debugMode = settings.debugMode || false;
                      } catch (e) {
                        console.error("Error parsing settings:", e);
                      }
                    }

                    if (debugMode) {
                      const totalCards = selectedDecks.reduce(
                        (sum, deck) => sum + deck.cardCount,
                        0
                      );
                      return ` (${totalCards} card${
                        totalCards === 1 ? "" : "s"
                      })`;
                    }
                    return "";
                  })()}`}
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
            onCardCountChange={handleCardCountChange}
          />
        )}

        {selectedDeckForCard && (
          <AddCardModal
            open={isAddCardModalOpen}
            onOpenChange={setIsAddCardModalOpen}
            onAddCard={handleAddCardSubmit}
            onAddMultipleCards={handleAddMultipleCards}
            deckName={selectedDeckForCard.deckName}
            availableDecks={categories.flatMap((category) =>
              category.decks.map((deck) => ({
                id: deck.id,
                name: deck.name,
                categoryName: category.name,
              }))
            )}
            defaultDeckId={selectedDeckForCard.deckId}
          />
        )}

        {/* Add Deck Modal from FAB */}
        <AddDeckModal
          open={isAddDeckFromFabModalOpen}
          onOpenChange={setIsAddDeckFromFabModalOpen}
          onAddDeck={(name) => {
            if (selectedCategoryIdForDeck && name) {
              handleAddDeck(selectedCategoryIdForDeck);
              setIsAddDeckFromFabModalOpen(false);
            }
          }}
          categoryId={selectedCategoryIdForDeck || ""}
          categoryName={
            categories.find((c) => c.id === selectedCategoryIdForDeck)?.name ||
            ""
          }
          categories={categories}
          onCategoryChange={setSelectedCategoryIdForDeck}
        />
      </SidebarProvider>
    </div>
  );
}
