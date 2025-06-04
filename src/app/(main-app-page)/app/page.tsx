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
import {
  getAllCategoriesWithDecks,
  createCategory,
  updateItemsOrder,
} from "@/features/categories/category";
import { toast } from "sonner";
import AddCardModal from "./components/add-card-modal";
import AddDeckModal from "./components/add-deck-modal";
import MagicDeckModal from "@/components/magic-deck-modal";
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
import { LoadingScreen } from "@/components/loading-screen";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";

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

  // Rename the magic deck modal state to match its usage
  const [isMagicDeckModalOpen, setIsMagicDeckModalOpen] = useState(false);

  // Add state for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    type: "category" | "deck";
    id: string;
    name: string;
    categoryId?: string;
  } | null>(null);

  // Helper function to toggle simulate delay
  const toggleSimulateDelay = () => {
    try {
      // Get current settings
      const savedSettings = localStorage.getItem("ez-anki-settings") || "{}";
      const settings = JSON.parse(savedSettings);

      // Toggle the simulate delay setting
      settings.simulateDelay = !settings.simulateDelay;

      // Save the updated settings
      localStorage.setItem("ez-anki-settings", JSON.stringify(settings));

      // Show a toast message
      toast.success(
        `Simulate delay ${settings.simulateDelay ? "enabled" : "disabled"}`
      );

      // Reload the page to apply the change
      window.location.reload();
    } catch (error) {
      console.error("Error toggling simulate delay:", error);
      toast.error("Failed to toggle simulate delay setting");
    }
  };

  // Helper function to toggle simulate empty decks
  const toggleSimulateEmptyDecks = () => {
    try {
      // Get current settings
      const savedSettings = localStorage.getItem("ez-anki-settings") || "{}";
      const settings = JSON.parse(savedSettings);

      // Toggle the simulate empty decks setting
      settings.simulateEmptyDecks = !settings.simulateEmptyDecks;

      // Save the updated settings
      localStorage.setItem("ez-anki-settings", JSON.stringify(settings));

      // Show a toast message
      toast.success(
        `Simulate empty decks ${
          settings.simulateEmptyDecks ? "enabled" : "disabled"
        }`
      );

      // Reload the page to apply the change
      window.location.reload();
    } catch (error) {
      console.error("Error toggling simulate empty decks:", error);
      toast.error("Failed to toggle simulate empty decks setting");
    }
  };

  // Add keyboard shortcuts (Shift+Alt+D for delay, Shift+Alt+E for empty decks)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.altKey) {
        if (e.key.toLowerCase() === "d") {
          toggleSimulateDelay();
        } else if (e.key.toLowerCase() === "e") {
          toggleSimulateEmptyDecks();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch categories and decks on mount
  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      // Simulated delay for testing the loading screen (3 seconds)
      // This can be toggled with a debug setting
      const savedSettings = localStorage.getItem("ez-anki-settings");
      let simulateDelay = false;
      let simulateEmptyDecks = false;

      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          simulateDelay = settings.simulateDelay || false;
          simulateEmptyDecks = settings.simulateEmptyDecks || false;
        } catch (e) {
          console.error("Error parsing settings:", e);
        }
      }

      if (simulateDelay) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Check if we should simulate empty decks
      if (simulateEmptyDecks) {
        // Create a simulated default category with no decks
        const simulatedData = [
          {
            id: "default-category",
            name: "Default",
            decks: [],
          },
        ];

        setCategories(simulatedData);
        setIsLoading(false);
        return;
      }

      const data = await getAllCategoriesWithDecks();

      // Transform the data to match our UI interface
      const transformedCategories: UICategory[] = data.map(
        (category: DatabaseCategory) => ({
          id: category.id,
          name: category.name,
          decks:
            category.decks?.map((deck: DatabaseDeck) => ({
              id: deck.id,
              name: deck.name,
              selected: false,
              cardCount: deck.card_count || 0,
            })) || [],
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

  useEffect(() => {
    fetchCategories();
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

  // This is the handler for the AddDeckModal
  const handleAddDeckFromModal = async (name: string, deckId: string) => {
    try {
      // Find the category and add the new deck to it
      if (selectedCategoryIdForDeck) {
        setCategories(prevCategories => 
          prevCategories.map(category => {
            if (category.id === selectedCategoryIdForDeck) {
              return {
                ...category,
                decks: [...category.decks, {
                  id: deckId,
                  name: name,
                  selected: false,
                  cardCount: 0
                }]
              };
            }
            return category;
          })
        );

        // Keep the category ID but don't reopen the modal
        setIsAddDeckFromFabModalOpen(false);
      }
      
      toast.success(`Deck "${name}" added successfully`);
    } catch (error) {
      console.error("Error updating categories:", error);
      toast.error("Failed to update decks");
    }
  };

  // This is the handler for the sidebar
  const handleAddDeck = (categoryId: string) => {
    setSelectedCategoryIdForDeck(categoryId);
    setIsAddDeckFromFabModalOpen(false);
  };

  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
  };

  const handleAddCategorySubmit = async () => {
    if (newCategoryName.trim()) {
      try {
        const createdCategory = await createCategory(newCategoryName);

        const newCategory: UICategory = {
          id: createdCategory.id,
          name: createdCategory.name,
          decks: [],
        };

        setCategories([...categories, newCategory]);
        toast.success(`Category "${newCategoryName}" added`);
        setNewCategoryName("");
        setIsAddCategoryModalOpen(false);
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create category"
        );
      }
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

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setDeleteItem({
        type: "category",
        id: category.id,
        name: category.name,
      });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteDeck = (categoryId: string, deckId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const deck = category?.decks.find((d) => d.id === deckId);
    if (category && deck) {
      setDeleteItem({
        type: "deck",
        id: deckId,
        name: deck.name,
        categoryId,
      });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;

    try {
      if (deleteItem.type === "category") {
        // TODO: Call API to delete category
        setCategories((prev) => prev.filter((c) => c.id !== deleteItem.id));
        toast.success(`Category "${deleteItem.name}" deleted`);
      } else {
        // TODO: Call API to delete deck
        setCategories((prev) =>
          prev.map((category) => {
            if (category.id === deleteItem.categoryId) {
              return {
                ...category,
                decks: category.decks.filter(
                  (deck) => deck.id !== deleteItem.id
                ),
              };
            }
            return category;
          })
        );
        toast.success(`Deck "${deleteItem.name}" deleted`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
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

  // Add handler for saving category and deck order
  const handleSaveOrder = async (updatedCategories: UICategory[]) => {
    try {
      // Convert to the format expected by our API
      const orderUpdates = updatedCategories.flatMap(
        (category, categoryIndex) => {
          // Create category order update
          const categoryUpdate = {
            id: category.id,
            type: "category" as const,
            order: categoryIndex,
          };

          // Create deck order updates
          const deckUpdates = category.decks.map((deck, deckIndex) => ({
            id: deck.id,
            type: "deck" as const,
            order: deckIndex,
          }));

          return [categoryUpdate, ...deckUpdates];
        }
      );

      // Call the API to update the orders
      await updateItemsOrder(orderUpdates);

      // Fetch updated categories to reflect the changes
      fetchCategories();

      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to update order");
      throw error;
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
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
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
            onDeleteCategory={handleDeleteCategory}
            onAddCard={(front, back, deckId) => {
              // Set up selected deck and open add card modal
              const deck = categories
                .flatMap((category) => category.decks)
                .find((deck) => deck.id === deckId);

              if (deck) {
                const category = categories.find((c) =>
                  c.decks.some((d) => d.id === deckId)
                );

                if (category) {
                  setSelectedDeckForCard({
                    deckId,
                    deckName: deck.name,
                    categoryName: category.name,
                  });
                  setIsAddCardModalOpen(true);
                }
              }
            }}
            onMagicDeckGenerate={() => setIsMagicDeckModalOpen(true)}
            onAddCardGeneral={handleAddCardGeneral}
            onSaveOrder={handleSaveOrder}
          />
          <SidebarInset className="flex flex-col pt-0">
            <LoadingScreen
              isLoading={true}
              hasContent={true}
              onAddCategory={handleAddCategory}
              onOpenMagicDeck={() => setIsMagicDeckModalOpen(true)}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  // Show empty state when there's only a default category with no decks
  if (
    categories.length === 1 &&
    categories[0].name === "Default" &&
    categories[0].decks.length === 0
  ) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
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
            onDeleteCategory={handleDeleteCategory}
            onAddCard={(front, back, deckId) => {
              // Set up selected deck and open add card modal
              const deck = categories
                .flatMap((category) => category.decks)
                .find((deck) => deck.id === deckId);

              if (deck) {
                const category = categories.find((c) =>
                  c.decks.some((d) => d.id === deckId)
                );

                if (category) {
                  setSelectedDeckForCard({
                    deckId,
                    deckName: deck.name,
                    categoryName: category.name,
                  });
                  setIsAddCardModalOpen(true);
                }
              }
            }}
            onMagicDeckGenerate={() => setIsMagicDeckModalOpen(true)}
            onAddCardGeneral={handleAddCardGeneral}
            onSaveOrder={handleSaveOrder}
          />
          <SidebarInset className="flex flex-col pt-0">
            <LoadingScreen
              isLoading={false}
              hasContent={false}
              onAddCategory={() => {
                // Open add deck modal with default category selected
                if (categories.length > 0) {
                  setSelectedCategoryIdForDeck(categories[0].id);
                  setIsAddDeckFromFabModalOpen(true);
                }
              }}
              onOpenMagicDeck={() => setIsMagicDeckModalOpen(true)}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${
          deleteItem?.type === "category" ? "Category" : "Deck"
        }`}
        description={
          deleteItem
            ? deleteItem.type === "category"
              ? `Are you sure you want to delete "${deleteItem.name}"? This will also delete all decks and cards inside this category.`
              : `Are you sure you want to delete "${deleteItem.name}"? This will also delete all cards in this deck.`
            : ""
        }
      />

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
          onDeleteCategory={handleDeleteCategory}
          onAddCard={(front, back, deckId) => {
            // Set up selected deck and open add card modal
            const deck = categories
              .flatMap((category) => category.decks)
              .find((deck) => deck.id === deckId);

            if (deck) {
              const category = categories.find((c) =>
                c.decks.some((d) => d.id === deckId)
              );

              if (category) {
                setSelectedDeckForCard({
                  deckId,
                  deckName: deck.name,
                  categoryName: category.name,
                });
                setIsAddCardModalOpen(true);
              }
            }
          }}
          onMagicDeckGenerate={() => setIsMagicDeckModalOpen(true)}
          onAddCardGeneral={handleAddCardGeneral}
          onSaveOrder={handleSaveOrder}
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

          {/* Debug Settings Indicator */}
          {(() => {
            // Check for debug settings
            const savedSettings = localStorage.getItem("ez-anki-settings");
            let debugMode = false;
            let simulateDelay = false;

            if (savedSettings) {
              try {
                const settings = JSON.parse(savedSettings);
                debugMode = settings.debugMode || false;
                simulateDelay = settings.simulateDelay || false;
              } catch (e) {
                console.error("Error parsing settings:", e);
              }
            }

            // Only show debug indicator if in debug mode
            if (debugMode) {
              return (
                <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
                  <span>Debug Mode</span>
                  <button
                    onClick={toggleSimulateDelay}
                    className={`px-2 py-1 rounded text-xs ${
                      simulateDelay
                        ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {simulateDelay ? "Delay: ON" : "Delay: OFF"}
                  </button>
                </div>
              );
            }

            return null;
          })()}
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
        {isAddDeckFromFabModalOpen && (
          <AddDeckModal
            open={isAddDeckFromFabModalOpen}
            onOpenChange={setIsAddDeckFromFabModalOpen}
            onAddDeck={handleAddDeckFromModal}
            categoryId={selectedCategoryIdForDeck}
            categoryName={
              categories.find((c) => c.id === selectedCategoryIdForDeck)?.name || ""
            }
            categories={categories}
            onCategoryChange={setSelectedCategoryIdForDeck}
            onRefresh={fetchCategories}
          />
        )}

        {/* Add Magic Deck Modal */}
        {isMagicDeckModalOpen && (
          <MagicDeckModal
            open={isMagicDeckModalOpen}
            onOpenChange={setIsMagicDeckModalOpen}
            onGenerate={(
              categoryId: string,
              deckName: string,
              prompt: string
            ) => {
              // Here you would implement the magic deck generation logic
              console.log("Generating deck:", categoryId, deckName, prompt);
              toast.success("Magic deck generated successfully!");
              setIsMagicDeckModalOpen(false);
            }}
            categories={categories}
          />
        )}
      </SidebarProvider>
    </div>
  );
}
