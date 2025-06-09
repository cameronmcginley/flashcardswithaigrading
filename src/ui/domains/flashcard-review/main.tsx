"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  getAllCategoriesWithDecks,
  createCategory,
  updateItemsOrder,
  deleteCategory,
} from "@/api/categories/category";
import {
  getAllCardsInDeck,
  createCard,
  updateCardFrontAndOrBack,
  deleteCard,
  createManyCards,
} from "@/api/cards/card";
import { updateDeck, createDeck, deleteDeck } from "@/api/decks/deck";
import { toast } from "sonner";
import { AddDeckModal } from "./modals/add-deck-modal";
import { MagicDeckModal } from "./modals/magic-deck-modal";
import { DeckInfoModal } from "./modals/deck-info-modal";
import { AddCardModal } from "./modals/add-card-modal";
import { LoadingScreen } from "./loading-screen/loading-screen";
import { FreshAccountScreen } from "./fresh-account-screen/fresh-account-screen";
import { DeleteConfirmationDialog } from "./modals/delete-confirmation-dialog";
import { Content } from "./content/content";
import { UICategoryWithDecks, DeleteItem, UICard } from "./types";
import { AddCategoryModal } from "./modals/add-category-modal";

export const Main = () => {
  const [categories, setCategories] = useState<UICategoryWithDecks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDecks, setSelectedDecks] = useState<
    { deckId: string; cardCount: number }[]
  >([]);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DeleteItem | null>(null);
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [selectedCategoryIdForDeck, setSelectedCategoryIdForDeck] = useState<
    string | null
  >(null);
  const [isMagicDeckModalOpen, setIsMagicDeckModalOpen] = useState(false);

  // Deck Info Modal state
  const [isDeckInfoModalOpen, setIsDeckInfoModalOpen] = useState(false);
  const [selectedDeckInfo, setSelectedDeckInfo] = useState<{
    deckId: string;
    deckName: string;
    categoryId: string;
    categoryName: string;
  } | null>(null);
  const [deckCards, setDeckCards] = useState<UICard[]>([]);
  const [isDeckCardsLoading, setIsDeckCardsLoading] = useState(false);

  // Add Card Modal state (for deck info modal)
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<UICard | null>(
    null
  );
  const [isDeleteCardModalOpen, setIsDeleteCardModalOpen] = useState(false);

  // -------- Helpers --------
  const showFreshAccountPage = () =>
    categories.length === 1 &&
    categories[0].name === "Default" &&
    categories[0].decks.length === 0;

  // -------- Hotkey Simulate Features --------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.altKey) {
        if (e.key.toLowerCase() === "d") toggleSimulateDelay();
        else if (e.key.toLowerCase() === "e") toggleSimulateEmptyDecks();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, []);

  const toggleSimulateDelay = () => {
    try {
      const settings = JSON.parse(
        localStorage.getItem("flashcardswithaigrading-settings") || "{}"
      );
      settings.simulateDelay = !settings.simulateDelay;
      localStorage.setItem(
        "flashcardswithaigrading-settings",
        JSON.stringify(settings)
      );
      toast.success(
        `Simulate delay ${settings.simulateDelay ? "enabled" : "disabled"}`
      );
      window.location.reload();
    } catch {
      toast.error("Failed to toggle simulate delay setting");
    }
  };

  const toggleSimulateEmptyDecks = () => {
    try {
      const settings = JSON.parse(
        localStorage.getItem("flashcardswithaigrading-settings") || "{}"
      );
      settings.simulateEmptyDecks = !settings.simulateEmptyDecks;
      localStorage.setItem(
        "flashcardswithaigrading-settings",
        JSON.stringify(settings)
      );
      toast.success(
        `Simulate empty decks ${
          settings.simulateEmptyDecks ? "enabled" : "disabled"
        }`
      );
      window.location.reload();
    } catch {
      toast.error("Failed to toggle simulate empty decks setting");
    }
  };

  // -------- Fetch Categories --------
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const savedSettings = localStorage.getItem(
        "flashcardswithaigrading-settings"
      );
      let simulateDelay = false,
        simulateEmptyDecks = false;
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          simulateDelay = settings.simulateDelay || false;
          simulateEmptyDecks = settings.simulateEmptyDecks || false;
        } catch {}
      }
      if (simulateDelay) await new Promise((r) => setTimeout(r, 3000));
      if (simulateEmptyDecks) {
        setCategories([{ id: "default-category", name: "Default", decks: [] }]);
        setIsLoading(false);
        return;
      }
      const data = await getAllCategoriesWithDecks();
      const transformedCategories = data.map((category) => ({
        id: category.id,
        name: category.name,
        decks: (category.decks || []).map((deck) => ({
          id: deck.id,
          name: deck.name,
          selected: false,
          cardCount: deck.card_count || 0,
          categoryId: category.id,
        })),
      }));
      setCategories(transformedCategories);
    } catch {
      toast.error("Failed to load categories and decks");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  // -------- Deck Info Modal Functions --------
  const fetchDeckCards = async (deckId: string) => {
    setIsDeckCardsLoading(true);
    try {
      const cards = await getAllCardsInDeck(deckId);
      const transformedCards: UICard[] = cards.map((card) => ({
        id: card.id,
        deckId: card.deck_id,
        front: card.front,
        back: card.back,
        ease: card.ease ?? 2.5,
        review_count: card.review_count ?? 0,
        correct_count: card.correct_count ?? 0,
        partial_correct_count: card.partial_correct_count ?? 0,
        incorrect_count: card.incorrect_count ?? 0,
        last_reviewed: card.last_reviewed
          ? new Date(card.last_reviewed)
          : new Date(0),
      }));
      setDeckCards(transformedCards);
    } catch (error) {
      console.error("Failed to fetch deck cards:", error);
      toast.error("Failed to load deck cards");
      setDeckCards([]);
    } finally {
      setIsDeckCardsLoading(false);
    }
  };

  const handleUpdateDeckName = async (deckId: string, newName: string) => {
    try {
      await updateDeck(deckId, newName);

      // Update local state
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          decks: category.decks.map((deck) =>
            deck.id === deckId ? { ...deck, name: newName } : deck
          ),
        }))
      );

      // Update selected deck info if it matches
      if (selectedDeckInfo?.deckId === deckId) {
        setSelectedDeckInfo((prev) =>
          prev ? { ...prev, deckName: newName } : null
        );
      }

      toast.success("Deck name updated successfully");
    } catch (error) {
      console.error("Failed to update deck name:", error);
      toast.error("Failed to update deck name");
    }
  };

  const handleAddCardToDeck = async (
    deckId: string,
    front: string,
    back: string
  ) => {
    try {
      const newCard = await createCard(deckId, front, back);
      const transformedCard: UICard = {
        id: newCard.id,
        deckId: newCard.deck_id,
        front: newCard.front,
        back: newCard.back,
        ease: newCard.ease ?? 2.5,
        review_count: newCard.review_count ?? 0,
        correct_count: newCard.correct_count ?? 0,
        partial_correct_count: newCard.partial_correct_count ?? 0,
        incorrect_count: newCard.incorrect_count ?? 0,
        last_reviewed: newCard.last_reviewed
          ? new Date(newCard.last_reviewed)
          : new Date(0),
      };

      setDeckCards((prev) => [...prev, transformedCard]);

      // Update card count in categories
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          decks: category.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, cardCount: (deck.cardCount ?? 0) + 1 }
              : deck
          ),
        }))
      );

      toast.success("Card added successfully");
    } catch (error) {
      console.error("Failed to add card:", error);
      toast.error("Failed to add card");
    }
  };

  const handleUpdateCard = async (
    cardId: string,
    front: string,
    back: string
  ) => {
    try {
      await updateCardFrontAndOrBack(cardId, front, back);

      setDeckCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, front, back } : card
        )
      );

      toast.success("Card updated successfully");
    } catch (error) {
      console.error("Failed to update card:", error);
      toast.error("Failed to update card");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);

      const deletedCard = deckCards.find((card) => card.id === cardId);
      setDeckCards((prev) => prev.filter((card) => card.id !== cardId));

      // Update card count in categories
      if (deletedCard) {
        setCategories((prev) =>
          prev.map((category) => ({
            ...category,
            decks: category.decks.map((deck) =>
              deck.id === deletedCard.deckId
                ? { ...deck, cardCount: Math.max((deck.cardCount ?? 0) - 1, 0) }
                : deck
            ),
          }))
        );
      }

      toast.success("Card deleted successfully");
    } catch (error) {
      console.error("Failed to delete card:", error);
      toast.error("Failed to delete card");
    }
  };

  // -------- Sidebar Actions --------
  const handleAddCategory = () => setIsAddCategoryModalOpen(true);

  const handleAddCategorySubmit = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const createdCategory = await createCategory(newCategoryName);
      setCategories([
        ...categories,
        { id: createdCategory.id, name: createdCategory.name, decks: [] },
      ]);
      toast.success(`Category "${newCategoryName}" added`);
      setNewCategoryName("");
      setIsAddCategoryModalOpen(false);
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleAddDeck = (categoryId: string) => {
    setSelectedCategoryIdForDeck(categoryId);
    setIsAddDeckModalOpen(true);
  };

  const handleMagicDeck = () => {
    setIsMagicDeckModalOpen(true);
  };

  const handleAddDeckModalSubmit = async (
    name: string,
    deckId: string,
    jsonContent?: string
  ) => {
    if (!selectedCategoryIdForDeck) return;

    try {
      let createdDeck;
      let cardCount = 0;

      if (jsonContent) {
        // Validate JSON structure
        const parsed = JSON.parse(jsonContent);
        if (!Array.isArray(parsed)) {
          toast.error("Validation Error", {
            description: "JSON must be an array of cards.",
          });
          return;
        }

        // Check if each card has front and back
        const isValid = parsed.every((card) => card.front && card.back);
        if (!isValid) {
          toast.error("Validation Error", {
            description: "Each card must have 'front' and 'back' fields.",
          });
          return;
        }

        // Create the deck
        createdDeck = await createDeck(name, selectedCategoryIdForDeck);

        // Create the cards
        await createManyCards(
          createdDeck.id,
          parsed.map((card) => ({
            front: card.front,
            back: card.back,
          }))
        );

        cardCount = parsed.length;
      } else {
        // If no JSON content, just create an empty deck
        createdDeck = await createDeck(name, selectedCategoryIdForDeck);
      }

      // Update local state
      setCategories((prev) =>
        prev.map((category) =>
          category.id === selectedCategoryIdForDeck
            ? {
                ...category,
                decks: [
                  ...category.decks,
                  {
                    id: createdDeck.id,
                    name,
                    selected: false,
                    cardCount: cardCount,
                    categoryId: category.id,
                  },
                ],
              }
            : category
        )
      );

      toast.success(
        `Deck "${name}" added successfully${
          cardCount > 0 ? ` with ${cardCount} cards` : ""
        }`
      );
      setIsAddDeckModalOpen(false);
    } catch (error) {
      console.error("Error creating deck:", error);
      toast.error("Failed to create deck", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleEditCategory = (categoryId: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName } : cat
      )
    );
    toast.success("Category updated");
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setDeleteItem({ type: "category", id: category.id, name: category.name });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteDeck = (deckId: string, categoryId: string) => {
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
        // Find the category to get its decks for updating selected state
        const categoryToDelete = categories.find((c) => c.id === deleteItem.id);
        if (categoryToDelete) {
          // Delete the category and all its contents
          await deleteCategory(deleteItem.id);

          // Remove any selected decks that were in this category
          setSelectedDecks((prev) =>
            prev.filter(
              (deck) =>
                !categoryToDelete.decks.some(
                  (catDeck) => catDeck.id === deck.deckId
                )
            )
          );
        }

        // Update UI state
        setCategories((prev) => prev.filter((c) => c.id !== deleteItem.id));
        toast.success(`Category "${deleteItem.name}" deleted`);
      } else {
        // Delete the deck and all its cards
        await deleteDeck(deleteItem.id);

        // Update UI state
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === deleteItem.categoryId
              ? {
                  ...cat,
                  decks: cat.decks.filter((d) => d.id !== deleteItem.id),
                }
              : cat
          )
        );

        // Remove the deck from selected decks if it was selected
        setSelectedDecks((prev) =>
          prev.filter((deck) => deck.deckId !== deleteItem.id)
        );

        toast.success(`Deck "${deleteItem.name}" deleted`);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(`Failed to delete ${deleteItem.type}`);
      return;
    }
    setIsDeleteDialogOpen(false);
    setDeleteItem(null);
  };

  const handleDeckSelect = (categoryId: string, deckId: string) => {
    setCategories((prev) => {
      const updatedCategories = prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              decks: category.decks.map((deck) =>
                deck.id === deckId
                  ? { ...deck, selected: !deck.selected }
                  : deck
              ),
            }
          : category
      );

      // Update selectedDecks based on the updated categories state
      setSelectedDecks(
        updatedCategories.flatMap((c) =>
          c.decks
            .filter((d) => d.selected)
            .map((d) => ({ deckId: d.id, cardCount: d.cardCount ?? 0 }))
        )
      );

      return updatedCategories;
    });
  };

  const handleEditDeck = (deckId: string, categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const deck = category?.decks.find((d) => d.id === deckId);

    if (category && deck) {
      setSelectedDeckInfo({
        deckId: deck.id,
        deckName: deck.name,
        categoryId: category.id,
        categoryName: category.name,
      });
      setIsDeckInfoModalOpen(true);
      fetchDeckCards(deckId);
    } else {
      toast.error("Deck not found");
    }
  };

  const handleSaveOrder = async (updatedCategories: UICategoryWithDecks[]) => {
    try {
      const orderUpdates = updatedCategories.flatMap((cat, idx) => [
        { id: cat.id, type: "category" as const, order: idx },
        ...cat.decks.map((deck, dIdx) => ({
          id: deck.id,
          type: "deck" as const,
          order: dIdx,
        })),
      ]);
      await updateItemsOrder(orderUpdates);
      fetchCategories();
      toast.success("Order updated successfully");
    } catch {
      toast.error("Failed to update order");
    }
  };

  // For Add Content FAB -> "Add Card" (just show error)
  const handleFabAddCard = () => {
    toast("Add Card via FAB: Not implemented");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
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
          isLoading={isLoading}
          onAddCategory={handleAddCategory}
          onAddDeck={handleAddDeck}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onDeckSelect={handleDeckSelect}
          onEditDeck={handleEditDeck}
          onDeleteDeck={handleDeleteDeck}
          onFabAddCard={handleFabAddCard}
          onMagicDeck={handleMagicDeck}
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
                  } selected (${selectedDecks.reduce(
                    (sum, deck) => sum + deck.cardCount,
                    0
                  )} cards)`}
            </span>
          </header>
          <div className="flex-1 overflow-auto p-4 pt-0">
            {isLoading ? (
              <LoadingScreen />
            ) : showFreshAccountPage() ? (
              <FreshAccountScreen
                onAddDeck={() => setIsAddDeckModalOpen(true)}
                onOpenMagicDeck={() => setIsMagicDeckModalOpen(true)}
              />
            ) : (
              <Content selectedDecks={selectedDecks} />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>

      <AddCategoryModal
        open={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
        onAddCategory={handleAddCategorySubmit}
      />

      <AddDeckModal
        open={isAddDeckModalOpen}
        onOpenChange={setIsAddDeckModalOpen}
        onAddDeck={handleAddDeckModalSubmit}
        categoryId={selectedCategoryIdForDeck || ""}
        categories={categories}
        onCategoryChange={setSelectedCategoryIdForDeck}
      />

      <MagicDeckModal
        open={isMagicDeckModalOpen}
        onOpenChange={setIsMagicDeckModalOpen}
        onGenerate={() => setIsMagicDeckModalOpen(false)}
        categories={categories}
      />

      <DeckInfoModal
        open={isDeckInfoModalOpen}
        onOpenChange={setIsDeckInfoModalOpen}
        deckId={selectedDeckInfo?.deckId || ""}
        deckName={selectedDeckInfo?.deckName || ""}
        categoryName={selectedDeckInfo?.categoryName || ""}
        cards={deckCards}
        isLoading={isDeckCardsLoading}
        onUpdateDeckName={handleUpdateDeckName}
        onAddCard={setIsAddCardModalOpen}
        onDeleteCard={setIsDeleteCardModalOpen}
        onUpdateCard={setIsAddCardModalOpen}
        setSelectedCardForEdit={setSelectedCardForEdit}
      />

      <AddCardModal
        open={isAddCardModalOpen}
        onOpenChange={setIsAddCardModalOpen}
        onAddCard={(front, back, deckId) =>
          handleAddCardToDeck(deckId, front, back)
        }
        onUpdateCard={handleUpdateCard}
        availableDecks={
          selectedDeckInfo
            ? [
                {
                  id: selectedDeckInfo.deckId,
                  name: selectedDeckInfo.deckName,
                  categoryId: selectedDeckInfo.categoryId,
                },
              ]
            : []
        }
        defaultDeckId={selectedDeckInfo?.deckId}
        editMode={!!selectedCardForEdit}
        initialCard={selectedCardForEdit || undefined}
      />

      <DeleteConfirmationDialog
        open={isDeleteCardModalOpen}
        onOpenChange={setIsDeleteCardModalOpen}
        onConfirm={() => {
          if (selectedCardForEdit) {
            handleDeleteCard(selectedCardForEdit.id);
            setIsDeleteCardModalOpen(false);
            setSelectedCardForEdit(null);
          }
        }}
        title="Delete Card"
        description={`Are you sure you want to delete "${
          selectedCardForEdit?.front || "this card"
        }"? This action cannot be undone.`}
      />
    </div>
  );
};
