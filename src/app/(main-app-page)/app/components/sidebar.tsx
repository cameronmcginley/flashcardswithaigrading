"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Edit,
  Plus,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import AddDeckModal from "./add-deck-modal";
import AddCardModal from "./add-card-modal";
import AddCategoryModal from "./add-category-modal";
import DeckInfoModal from "./deck-info-modal";
import { cn } from "@/lib/utils";

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

interface SidebarProps {
  onSelectedDecksChange: (
    selectedDecks: { deckId: string; cardCount: number }[]
  ) => void;
  isOpen?: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  onSelectedDecksChange,
  isOpen = true,
  onToggle,
}: SidebarProps) {
  const [categories, setCategories] = useState(initialCategories);
  // Change the expandedCategories initialization to include all category IDs
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    initialCategories.map((cat) => cat.id)
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingDeck, setEditingDeck] = useState<{
    categoryId: string;
    deckId: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [selectedCategoryForNewDeck, setSelectedCategoryForNewDeck] = useState<
    string | null
  >(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeckInfoModalOpen, setIsDeckInfoModalOpen] = useState(false);
  const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(
    null
  );
  const [addingToDeckId, setAddingToDeckId] = useState<string | null>(null);
  const [currentDeckName, setCurrentDeckName] = useState<string>("");
  const [currentCategoryName, setCurrentCategoryName] = useState<string>("");
  const [contentVisible, setContentVisible] = useState(isOpen);

  const [selectedDeckInfo, setSelectedDeckInfo] = useState<{
    deckId: string;
    deckName: string;
    categoryName: string;
  } | null>(null);

  // Update content visibility based on sidebar state
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the sidebar has started expanding before showing content
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Hide content immediately when closing
      setContentVisible(false);
    }
  }, [isOpen]);

  // Update selected decks whenever checkbox state changes
  const updateSelectedDecks = (updatedCategories: typeof categories) => {
    const selectedDecks = updatedCategories.flatMap((category) =>
      category.decks
        .filter((deck) => deck.selected)
        .map((deck) => ({ deckId: deck.id, cardCount: deck.cardCount }))
    );
    onSelectedDecksChange(selectedDecks);
  };

  // Initialize selected decks on component mount
  useEffect(() => {
    updateSelectedDecks(categories);
  }, []);

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(
        expandedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const toggleDeckSelection = (categoryId: string, deckId: string) => {
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
    updateSelectedDecks(updatedCategories);
  };

  const startEditingCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setEditingCategory(categoryId);
      setEditName(category.name);
    }
  };

  const openDeckInfo = (categoryId: string, deckId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const deck = category?.decks.find((d) => d.id === deckId);

    if (category && deck) {
      setSelectedDeckInfo({
        deckId: deck.id,
        deckName: deck.name,
        categoryName: category.name,
      });
      setIsDeckInfoModalOpen(true);
    }
  };

  const saveEditingCategory = () => {
    if (editingCategory && editName.trim()) {
      setCategories(
        categories.map((category) => {
          if (category.id === editingCategory) {
            return { ...category, name: editName.trim() };
          }
          return category;
        })
      );
      setEditingCategory(null);
    }
  };

  const updateDeckName = (deckId: string, newName: string) => {
    setCategories(
      categories.map((category) => {
        return {
          ...category,
          decks: category.decks.map((deck) => {
            if (deck.id === deckId) {
              return { ...deck, name: newName.trim() };
            }
            return deck;
          }),
        };
      })
    );
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditingDeck(null);
  };

  const openAddCardModal = (
    categoryId: string,
    deckId: string,
    deckName: string
  ) => {
    setAddingToCategoryId(categoryId);
    setAddingToDeckId(deckId);
    setCurrentDeckName(deckName);
    setIsAddCardModalOpen(true);
  };

  const handleAddDeck = (deckName: string) => {
    if (selectedCategoryForNewDeck && deckName.trim()) {
      const updatedCategories = categories.map((category) => {
        if (category.id === selectedCategoryForNewDeck) {
          const newDeckId = `${category.id}-${category.decks.length + 1}`;
          return {
            ...category,
            decks: [
              ...category.decks,
              {
                id: newDeckId,
                name: deckName.trim(),
                selected: false,
                cardCount: 0,
              },
            ],
          };
        }
        return category;
      });

      setCategories(updatedCategories);
      updateSelectedDecks(updatedCategories);
    }
    setIsAddDeckModalOpen(false);
    setSelectedCategoryForNewDeck(null);
  };

  const handleAddCard = (question: string, answer: string, deckId: string) => {
    if (addingToCategoryId && addingToDeckId) {
      // Update the card count for the deck
      const updatedCategories = categories.map((category) => {
        if (category.id === addingToCategoryId) {
          return {
            ...category,
            decks: category.decks.map((deck) => {
              if (deck.id === addingToDeckId) {
                return { ...deck, cardCount: deck.cardCount + 1 };
              }
              return deck;
            }),
          };
        }
        return category;
      });

      setCategories(updatedCategories);
      updateSelectedDecks(updatedCategories);
    }
    setIsAddCardModalOpen(false);
    setAddingToCategoryId(null);
    setAddingToDeckId(null);
  };

  const handleAddMultipleCards = (
    cards: Array<{ question: string; answer: string }>,
    deckId: string
  ) => {
    if (addingToCategoryId && addingToDeckId) {
      // Update the card count for the deck
      const updatedCategories = categories.map((category) => {
        if (category.id === addingToCategoryId) {
          return {
            ...category,
            decks: category.decks.map((deck) => {
              if (deck.id === addingToDeckId) {
                return { ...deck, cardCount: deck.cardCount + cards.length };
              }
              return deck;
            }),
          };
        }
        return category;
      });

      setCategories(updatedCategories);
      updateSelectedDecks(updatedCategories);
    }
    setIsAddCardModalOpen(false);
    setAddingToCategoryId(null);
    setAddingToDeckId(null);
  };

  const handleAddCategory = (categoryName: string) => {
    if (categoryName.trim()) {
      const newCategoryId = `${categories.length + 1}`;
      const updatedCategories = [
        ...categories,
        {
          id: newCategoryId,
          name: categoryName.trim(),
          decks: [],
        },
      ];

      setCategories(updatedCategories);
      setExpandedCategories([...expandedCategories, newCategoryId]);
    }
    setIsAddCategoryModalOpen(false);
  };

  const handleDeleteCard = (cardId: string) => {
    // In a real app, you would call an API to delete the card
    // For now, we'll just update the card count
    if (selectedDeckInfo) {
      const updatedCategories = categories.map((category) => {
        return {
          ...category,
          decks: category.decks.map((deck) => {
            if (deck.id === selectedDeckInfo.deckId) {
              return { ...deck, cardCount: Math.max(0, deck.cardCount - 1) };
            }
            return deck;
          }),
        };
      });

      setCategories(updatedCategories);
      updateSelectedDecks(updatedCategories);
    }
  };

  const handleUpdateCard = (
    cardId: string,
    question: string,
    answer: string
  ) => {
    // In a real app, you would call an API to update the card
    // For this demo, we don't need to do anything with the categories state
    console.log("Card updated:", cardId, question, answer);
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

  const openAddDeckModal = () => {
    // If there are categories, default to the first one
    if (categories.length > 0) {
      setSelectedCategoryForNewDeck(categories[0].id);
    }
    setIsAddDeckModalOpen(true);
  };

  return (
    <div className="relative h-full">
      {/* Sidebar toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "absolute top-3 z-10 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700",
          isOpen ? "right-3" : "left-3"
        )}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </Button>

      <div
        className={cn(
          "border-r bg-white dark:bg-gray-800 flex flex-col h-full transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0"
        )}
      >
        <div
          className={cn(
            "flex-1 flex flex-col transition-opacity duration-200 ease-in-out",
            contentVisible ? "opacity-100" : "opacity-0 invisible"
          )}
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleCategory(category.id)}
                      >
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      {editingCategory === category.id ? (
                        <div className="flex items-center flex-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={saveEditingCategory}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="ml-1">{category.name}</span>
                      )}
                    </div>
                    {editingCategory !== category.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => startEditingCategory(category.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openAddDeckModal(category.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {expandedCategories.includes(category.id) && (
                    <div className="ml-6 space-y-1">
                      {category.decks.map((deck) => (
                        <div
                          key={deck.id}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center flex-1">
                            <Checkbox
                              id={`deck-${deck.id}`}
                              checked={deck.selected}
                              onCheckedChange={() =>
                                toggleDeckSelection(category.id, deck.id)
                              }
                              className="mr-2 h-4 w-4"
                            />
                            <div className="flex items-center justify-between flex-1">
                              <label
                                htmlFor={`deck-${deck.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {deck.name}{" "}
                                <span className="text-xs text-gray-500">
                                  ({deck.cardCount})
                                </span>
                              </label>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    openDeckInfo(category.id, deck.id)
                                  }
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    openAddCardModal(
                                      category.id,
                                      deck.id,
                                      deck.name
                                    )
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Category Button at the bottom */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => setIsAddCardModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => openAddDeckModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deck
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => setIsAddCategoryModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDeckModal
        open={isAddDeckModalOpen}
        onOpenChange={setIsAddDeckModalOpen}
        onAddDeck={(name) => {
          if (selectedCategoryForNewDeck) {
            handleAddDeck(name);
          }
        }}
        categoryId={selectedCategoryForNewDeck}
        categoryName={
          categories.find((c) => c.id === selectedCategoryForNewDeck)?.name ||
          ""
        }
        categories={categories}
        onCategoryChange={setSelectedCategoryForNewDeck}
      />

      <AddCardModal
        open={isAddCardModalOpen}
        onOpenChange={setIsAddCardModalOpen}
        onAddCard={handleAddCard}
        onAddMultipleCards={handleAddMultipleCards}
        deckName={currentDeckName}
        availableDecks={getAvailableDecks()}
        defaultDeckId={addingToDeckId || undefined}
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
          onUpdateDeckName={(newName) =>
            updateDeckName(selectedDeckInfo.deckId, newName)
          }
          onDeleteCard={handleDeleteCard}
          onUpdateCard={handleUpdateCard}
          onAddCard={() =>
            openAddCardModal(
              categories.find((c) => c.name === selectedDeckInfo.categoryName)
                ?.id || "",
              selectedDeckInfo.deckId,
              selectedDeckInfo.deckName
            )
          }
        />
      )}
    </div>
  );
}
