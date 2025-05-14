"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import AddDeckModal from "./add-deck-modal";
import AddCardModal from "./add-card-modal";
import AddCategoryModal from "./add-category-modal";
import DeckInfoModal from "./deck-info-modal";
import { cn } from "@/lib/utils";

interface Deck {
  id: string;
  name: string;
  selected: boolean;
  cardCount: number;
}

interface Category {
  id: string;
  name: string;
  decks: Deck[];
}

interface SidebarProps {
  categories: Category[];
  onSelectedDecksChange: (categoryId: string, deckId: string) => void;
  onAddDeck: (categoryId: string, name: string) => void;
  onAddCategory: (name: string) => void;
  onEditDeck: (deckId: string, deckName: string, categoryName: string) => void;
  isOpen?: boolean;
}

export default function Sidebar({
  categories,
  onSelectedDecksChange,
  onAddDeck,
  onAddCategory,
  onEditDeck,
  isOpen = true,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [selectedCategoryForNewDeck, setSelectedCategoryForNewDeck] = useState<
    string | null
  >(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeckInfoModalOpen, setIsDeckInfoModalOpen] = useState(false);
  const [addingToDeckId, setAddingToDeckId] = useState<string | null>(null);
  const [currentDeckName, setCurrentDeckName] = useState<string>("");

  const [selectedDeckInfo, setSelectedDeckInfo] = useState<{
    deckId: string;
    deckName: string;
    categoryName: string;
  } | null>(null);

  // Update content visibility based on sidebar state
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        // Handle sidebar close animation if needed
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(
        expandedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleUpdateDeckName = (newName: string) => {
    if (selectedDeckInfo) {
      onEditDeck(selectedDeckInfo.deckId, newName, selectedDeckInfo.categoryName);
      setSelectedDeckInfo((prev) =>
        prev ? { ...prev, deckName: newName } : null
      );
    }
  };

  const openDeckInfo = (categoryId: string, deckId: string) => {
    const category = categories.find((c: Category) => c.id === categoryId);
    const deck = category?.decks.find((d: Deck) => d.id === deckId);

    if (category && deck) {
      setSelectedDeckInfo({
        deckId: deck.id,
        deckName: deck.name,
        categoryName: category.name,
      });
      setIsDeckInfoModalOpen(true);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    console.log("Delete card", cardId);
  };

  const handleUpdateCard = (cardId: string, front: string, back: string) => {
    console.log("Update card", cardId, front, back);
  };

  const handleAddCard = () => {
    console.log("Add card");
  };

  // Get available decks for the AddCardModal
  const getAvailableDecks = () => {
    return categories.flatMap((category) =>
      category.decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        categoryName: category.name,
      }))
    );
  };

  const handleAddDeckToCategory = (name: string) => {
    if (selectedCategoryForNewDeck) {
      onAddDeck(name, selectedCategoryForNewDeck);
      setIsAddDeckModalOpen(false);
    }
  };

  const handleAddCategory = (name: string) => {
    onAddCategory(name);
    setIsAddCategoryModalOpen(false);
  };

  return (
    <div className={cn("h-full", isOpen ? "w-80" : "w-16")}>
      <div className="flex h-16 items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAddCategoryModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 px-2">
        {categories.map((category: Category) => (
          <div key={category.id}>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => toggleCategory(category.id)}
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {category.name}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedCategoryForNewDeck(category.id);
                  setIsAddDeckModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {expandedCategories.includes(category.id) && (
              <div className="ml-6 space-y-1">
                {category.decks.map((deck: Deck) => (
                  <div
                    key={deck.id}
                    className="flex items-center justify-between"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => openDeckInfo(category.id, deck.id)}
                    >
                      {deck.name}
                      <span className="ml-auto text-xs text-gray-500">
                        {deck.cardCount}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <AddDeckModal
        open={isAddDeckModalOpen}
        onOpenChange={setIsAddDeckModalOpen}
        onAddDeck={handleAddDeckToCategory}
        categoryId={selectedCategoryForNewDeck}
        categoryName={
          categories.find((c: Category) => c.id === selectedCategoryForNewDeck)
            ?.name || ""
        }
        categories={categories}
        onCategoryChange={setSelectedCategoryForNewDeck}
"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import AddDeckModal from "./add-deck-modal";
import AddCardModal from "./add-card-modal";
import AddCategoryModal from "./add-category-modal";
import DeckInfoModal from "./deck-info-modal";
import { cn } from "@/lib/utils";

interface Deck {
  id: string;
  name: string;
  selected: boolean;
  cardCount: number;
}

interface Category {
  id: string;
  name: string;
  decks: Deck[];
}

interface SidebarProps {
  categories: Category[];
  onSelectedDecksChange: (categoryId: string, deckId: string) => void;
  onAddDeck: (categoryId: string, name: string) => void;
  onAddCategory: (name: string) => void;
  onEditDeck: (deckId: string, deckName: string, categoryName: string) => void;
  isOpen?: boolean;
}

export default function Sidebar({
  categories,
  onSelectedDecksChange,
  onAddDeck,
  onAddCategory,
  onEditDeck,
  isOpen = true,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [selectedCategoryForNewDeck, setSelectedCategoryForNewDeck] = useState<
    string | null
  >(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeckInfoModalOpen, setIsDeckInfoModalOpen] = useState(false);
  const [addingToDeckId, setAddingToDeckId] = useState<string | null>(null);
  const [currentDeckName, setCurrentDeckName] = useState<string>("");

  const [selectedDeckInfo, setSelectedDeckInfo] = useState<{
    deckId: string;
    deckName: string;
    categoryName: string;
  } | null>(null);

  // Update content visibility based on sidebar state
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        // Handle sidebar close animation if needed
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(
        expandedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleUpdateDeckName = (newName: string) => {
    if (selectedDeckInfo) {
      onEditDeck(
        selectedDeckInfo.deckId,
        newName,
        selectedDeckInfo.categoryName
      );
      setSelectedDeckInfo((prev) =>
        prev ? { ...prev, deckName: newName } : null
      );
    }
  };

  const openDeckInfo = (categoryId: string, deckId: string) => {
    const category = categories.find((c: Category) => c.id === categoryId);
    const deck = category?.decks.find((d: Deck) => d.id === deckId);

    if (category && deck) {
      setSelectedDeckInfo({
        deckId: deck.id,
        deckName: deck.name,
        categoryName: category.name,
      });
      setIsDeckInfoModalOpen(true);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    console.log("Delete card", cardId);
  };

  const handleUpdateCard = (cardId: string, front: string, back: string) => {
    console.log("Update card", cardId, front, back);
  };

  const handleAddCard = () => {
    console.log("Add card");
  };

  // Get available decks for the AddCardModal
  const getAvailableDecks = () => {
    return categories.flatMap((category) =>
      category.decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        categoryName: category.name,
      }))
    );
  };

  const handleAddDeckToCategory = (name: string) => {
    if (selectedCategoryForNewDeck) {
      onAddDeck(name, selectedCategoryForNewDeck);
      setIsAddDeckModalOpen(false);
    }
  };

  const handleAddCategory = (name: string) => {
    onAddCategory(name);
    setIsAddCategoryModalOpen(false);
  };

  return (
    <div
      className={cn(
        "h-full w-[var(--sidebar-width)] flex-col border-r bg-muted/40 duration-300",
        isOpen ? "flex" : "hidden"
      )}
    >
      <div className="flex h-12 items-center justify-between px-4">
        <span className="text-lg font-semibold">Categories</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAddCategoryModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {categories.map((category) => (
          <div key={category.id} className="px-2">
            <div className="flex items-center justify-between py-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex items-center space-x-2"
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>{category.name}</span>
              </button>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedCategoryForNewDeck(category.id);
                    setIsAddDeckModalOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditDeck(category.id, category.name, "")}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {expandedCategories.includes(category.id) && (
              <div className="ml-6 space-y-1">
                {category.decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={deck.selected}
                        onCheckedChange={() =>
                          onSelectedDecksChange(category.id, deck.id)
                        }
                      />
                      <span
                        className="cursor-pointer"
                        onClick={() => openDeckInfo(category.id, deck.id)}
                      >
                        {deck.name} ({deck.cardCount})
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAddingToDeckId(deck.id);
                          setCurrentDeckName(deck.name);
                          setIsAddCardModalOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeckInfo(category.id, deck.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <AddDeckModal
        open={isAddDeckModalOpen}
        onOpenChange={setIsAddDeckModalOpen}
        onAddDeck={handleAddDeckToCategory}
        categoryId={selectedCategoryForNewDeck}
        categoryName={
          categories.find((c: Category) => c.id === selectedCategoryForNewDeck)
            ?.name || ""
        }
        categories={categories}
        onCategoryChange={setSelectedCategoryForNewDeck}
      />

      <AddCardModal
        open={isAddCardModalOpen}
        onOpenChange={setIsAddCardModalOpen}
        onAddCard={handleAddCard}
        defaultDeckId={addingToDeckId || undefined}
        deckName={currentDeckName}
        availableDecks={getAvailableDecks()}
      />

      <AddCategoryModal
        open={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
        onAddCategory={handleAddCategory}
      />

      {selectedDeckInfo && (
        <DeckInfoModal
          open={isDeckInfoModalOpen}
          onOpenChange={setIsDeckInfoModalOpen}
          deckId={selectedDeckInfo.deckId}
          deckName={selectedDeckInfo.deckName}
          categoryName={selectedDeckInfo.categoryName}
          onUpdateDeckName={handleUpdateDeckName}
        />
      )}
    </div>
  );
}
