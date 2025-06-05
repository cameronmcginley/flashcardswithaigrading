"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAllCategoriesWithDecks, createCategory, updateItemsOrder } from "@/api/categories/category";
import { toast } from "sonner";
import AddDeckModal from "./modals/add-deck-modal";
import MagicDeckModal from "./modals/magic-deck-modal";
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
import { LoadingScreen } from "./loading-screen/loading-screen";
import { FreshAccountScreen } from "./fresh-account-screen/fresh-account-screen";
import DeleteConfirmationDialog from "./modals/delete-confirmation-dialog";
import Content from "./content/content";
import {
  DatabaseCategory,
  DatabaseDeck,
  UICategory,
  DeleteItem,
} from "./types";

export default function Main() {
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDecks, setSelectedDecks] = useState<{ deckId: string; cardCount: number }[]>([]);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DeleteItem | null>(null);
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [selectedCategoryIdForDeck, setSelectedCategoryIdForDeck] = useState<string | null>(null);
  const [isMagicDeckModalOpen, setIsMagicDeckModalOpen] = useState(false);

  // -------- Helpers --------

  const showFreshAccountPage = () =>
    categories.length === 1 && categories[0].name === "Default" && categories[0].decks.length === 0;

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
      const settings = JSON.parse(localStorage.getItem("ez-anki-settings") || "{}");
      settings.simulateDelay = !settings.simulateDelay;
      localStorage.setItem("ez-anki-settings", JSON.stringify(settings));
      toast.success(`Simulate delay ${settings.simulateDelay ? "enabled" : "disabled"}`);
      window.location.reload();
    } catch {
      toast.error("Failed to toggle simulate delay setting");
    }
  };

  const toggleSimulateEmptyDecks = () => {
    try {
      const settings = JSON.parse(localStorage.getItem("ez-anki-settings") || "{}");
      settings.simulateEmptyDecks = !settings.simulateEmptyDecks;
      localStorage.setItem("ez-anki-settings", JSON.stringify(settings));
      toast.success(`Simulate empty decks ${settings.simulateEmptyDecks ? "enabled" : "disabled"}`);
      window.location.reload();
    } catch {
      toast.error("Failed to toggle simulate empty decks setting");
    }
  };

  // -------- Fetch Categories --------
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const savedSettings = localStorage.getItem("ez-anki-settings");
      let simulateDelay = false, simulateEmptyDecks = false;
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
      const transformedCategories: UICategory[] = data.map((category: DatabaseCategory) => ({
        id: category.id,
        name: category.name,
        decks: (category.decks || []).map((deck: DatabaseDeck) => ({
          id: deck.id,
          name: deck.name,
          selected: false,
          cardCount: deck.card_count || 0,
        })),
      }));
      setCategories(transformedCategories);
    } catch {
      toast.error("Failed to load categories and decks");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { fetchCategories(); }, []);

  // -------- Sidebar Actions --------
  const handleAddCategory = () => setIsAddCategoryModalOpen(true);

  const handleAddCategorySubmit = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const createdCategory = await createCategory(newCategoryName);
      setCategories([...categories, { id: createdCategory.id, name: createdCategory.name, decks: [] }]);
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

  const handleAddDeckModalSubmit = (name: string, deckId: string) => {
    if (!selectedCategoryIdForDeck) return;
    setCategories((prev) =>
      prev.map((category) =>
        category.id === selectedCategoryIdForDeck
          ? {
              ...category,
              decks: [
                ...category.decks,
                { id: deckId, name, selected: false, cardCount: 0 },
              ],
            }
          : category
      )
    );
    toast.success(`Deck "${name}" added successfully`);
    setIsAddDeckModalOpen(false);
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
    if (deleteItem.type === "category") {
      setCategories((prev) => prev.filter((c) => c.id !== deleteItem.id));
      toast.success(`Category "${deleteItem.name}" deleted`);
    } else {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === deleteItem.categoryId
            ? { ...cat, decks: cat.decks.filter((d) => d.id !== deleteItem.id) }
            : cat
        )
      );
      toast.success(`Deck "${deleteItem.name}" deleted`);
    }
    setIsDeleteDialogOpen(false);
    setDeleteItem(null);
  };

  const handleDeckSelect = (categoryId: string, deckId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              decks: category.decks.map((deck) =>
                deck.id === deckId ? { ...deck, selected: !deck.selected } : deck
              ),
            }
          : category
      )
    );
    // Update selectedDecks for MainArea/Content
    setSelectedDecks(
      categories
        .flatMap((c) =>
          c.decks.filter((d) => d.selected).map((d) => ({ deckId: d.id, cardCount: d.cardCount ?? 0 }))
        )
    );
  };

  const handleEditDeck = (deckId: string, categoryId: string) => {
    // Implement: set modal open and track which deck/category for editing if you have a deck modal.
    // setSelectedDeckInfo({ deckId, categoryId }); setIsDeckInfoModalOpen(true);
    toast("Not implemented: Edit deck modal");
  };

  const handleSaveOrder = async (updatedCategories: UICategory[]) => {
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

  // -------- UI/JSX --------

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Add Category Modal */}
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        {isAddCategoryModalOpen && (
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
              <Button variant="outline" onClick={() => setIsAddCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategorySubmit}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteItem?.type === "category" ? "Category" : "Deck"}`}
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
        style={{ "--sidebar-width": "clamp(22rem, 20vw, 30rem)" } as React.CSSProperties}
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
          onMagicDeck={() => setIsMagicDeckModalOpen(true)}
          onSaveOrder={handleSaveOrder}
        />
        <SidebarInset className="flex flex-col pt-0">
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
        </SidebarInset>
      </SidebarProvider>

      <AddDeckModal
        open={isAddDeckModalOpen}
        onOpenChange={setIsAddDeckModalOpen}
        onAddDeck={handleAddDeckModalSubmit}
        categoryId={selectedCategoryIdForDeck || ""}
        categoryName={
          categories.find((c) => c.id === selectedCategoryIdForDeck)?.name || ""
        }
        categories={categories}
        onCategoryChange={setSelectedCategoryIdForDeck}
      />

      <MagicDeckModal
        open={isMagicDeckModalOpen}
        onOpenChange={setIsMagicDeckModalOpen}
        onGenerate={() => setIsMagicDeckModalOpen(false)}
        categories={categories}
      />
    </div>
  );
}
