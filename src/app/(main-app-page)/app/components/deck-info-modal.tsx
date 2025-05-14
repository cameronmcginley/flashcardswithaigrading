"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash,
  Check,
  X,
  Plus,
  Search,
  Code,
  Copy,
  List,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllCardsInDeck,
  deleteCard,
  updateCardFrontAndOrBack,
  createCard,
} from "@/features/cards/card";
import { format } from "date-fns";
import AddCardModal from "./add-card-modal";

interface Card {
  id: string;
  front: string;
  back: string;
  ease: number;
  review_count: number;
  last_reviewed: string | null;
}

interface DeckInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  deckName: string;
  categoryName: string;
  onUpdateDeckName: (newName: string) => void;
  onCardCountChange?: (deckId: string, change: number) => void;
}

export default function DeckInfoModal({
  open,
  onOpenChange,
  deckId,
  deckName,
  categoryName,
  onUpdateDeckName,
  onCardCountChange,
}: DeckInfoModalProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempDeckName, setTempDeckName] = useState(deckName);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<Card | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"cards" | "json">("cards");
  const [sortColumn, setSortColumn] = useState<
    "front" | "ease" | "review_count" | "last_reviewed"
  >("last_reviewed");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCardsInDeck(deckId);
        setCards(data);
      } catch (err) {
        console.error("Error fetching cards:", err);
        toast.error("Failed to load cards");
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchCards();
    }
  }, [deckId, open]);

  const startEditingName = () => {
    setTempDeckName(deckName);
    setEditingName(true);
  };

  const saveDeckName = () => {
    if (tempDeckName.trim()) {
      onUpdateDeckName(tempDeckName);
      setEditingName(false);
      toast.success("Deck name updated");
    } else {
      toast.error("Deck name cannot be empty");
    }
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setTempDeckName(deckName);
  };

  const confirmDeleteCard = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardToDelete(cardId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);
      setCards(cards.filter((card) => card.id !== cardId));
      onCardCountChange?.(deckId, -1);
      toast.success("Card deleted successfully");
      setIsDeleteDialogOpen(false);
      setCardToDelete(null);
    } catch (err) {
      console.error("Error deleting card:", err);
      toast.error("Failed to delete card");
    }
  };

  const handleUpdateCard = async (
    cardId: string,
    front: string,
    back: string
  ) => {
    try {
      await updateCardFrontAndOrBack(cardId, front, back);
      setCards(
        cards.map((card) => {
          if (card.id === cardId) {
            return { ...card, front, back };
          }
          return card;
        })
      );
      toast.success("Card updated successfully");
      setIsAddCardModalOpen(false);
      setSelectedCardForEdit(null);
    } catch (err) {
      console.error("Error updating card:", err);
      toast.error("Failed to update card");
    }
  };

  const handleAddCard = async (front: string, back: string) => {
    try {
      const newCard = await createCard(deckId, front, back);
      setCards([...cards, newCard]);
      onCardCountChange?.(deckId, 1);
      toast.success("Card added successfully");
      setIsAddCardModalOpen(false);
    } catch (err) {
      console.error("Error adding card:", err);
      toast.error("Failed to add card");
    }
  };

  // Filter cards based on search query
  const filteredCards = searchQuery
    ? cards.filter((card) =>
        card.front.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cards;

  // Add sorting function
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortColumn === "front") {
      return sortDirection === "asc"
        ? a.front.localeCompare(b.front)
        : b.front.localeCompare(a.front);
    }
    if (sortColumn === "ease") {
      return sortDirection === "asc"
        ? (a.ease || 0) - (b.ease || 0)
        : (b.ease || 0) - (a.ease || 0);
    }
    if (sortColumn === "review_count") {
      return sortDirection === "asc"
        ? (a.review_count || 0) - (b.review_count || 0)
        : (b.review_count || 0) - (a.review_count || 0);
    }
    // last_reviewed
    const aDate = a.last_reviewed ? new Date(a.last_reviewed) : new Date(0);
    const bDate = b.last_reviewed ? new Date(b.last_reviewed) : new Date(0);
    return sortDirection === "asc"
      ? aDate.getTime() - bDate.getTime()
      : bDate.getTime() - aDate.getTime();
  });

  const toggleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Generate JSON representation of cards
  const cardsJson = JSON.stringify(
    cards.map(({ front, back }) => ({
      front,
      back,
    })),
    null,
    2
  );

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(cardsJson).then(
      () => {
        toast.success("JSON copied to clipboard");
      },
      () => {
        toast.error("Failed to copy JSON");
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempDeckName}
                    onChange={(e) => setTempDeckName(e.target.value)}
                    className="h-9 text-lg font-semibold"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" onClick={saveDeckName}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelEditingName}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <DialogTitle className="text-xl">{deckName}</DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startEditingName}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">{categoryName}</div>
          </DialogHeader>

          <div className="flex items-center justify-between gap-2 my-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => setIsAddCardModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">
                {filteredCards.length}{" "}
                {filteredCards.length === 1 ? "Card" : "Cards"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() =>
                  setCurrentView(currentView === "cards" ? "json" : "cards")
                }
              >
                {currentView === "cards" ? (
                  <>
                    <Code className="h-3.5 w-3.5 mr-1" />
                    Show JSON
                  </>
                ) : (
                  <>
                    <List className="h-3.5 w-3.5 mr-1" />
                    Show Cards
                  </>
                )}
              </Button>
            </div>

            <Tabs
              value={currentView}
              onValueChange={(value) =>
                setCurrentView(value as "cards" | "json")
              }
            >
              <TabsList className="hidden">
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="cards" className="mt-0">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading cards...
                  </div>
                ) : sortedCards.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => toggleSort("front")}
                              className="h-8 text-left font-medium"
                            >
                              Front
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => toggleSort("ease")}
                              className="h-8 text-left font-medium"
                            >
                              Ease
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => toggleSort("review_count")}
                              className="h-8 text-left font-medium"
                            >
                              Reviews
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => toggleSort("last_reviewed")}
                              className="h-8 text-left font-medium"
                            >
                              Last Reviewed
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedCards.map((card) => (
                          <TableRow
                            key={card.id}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="truncate max-w-[300px]">
                                      {card.front}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    className="max-w-md"
                                  >
                                    <p>{card.front}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>
                              {card.ease?.toFixed(2) || "N/A"}
                            </TableCell>
                            <TableCell>{card.review_count || 0}</TableCell>
                            <TableCell>
                              {card.last_reviewed
                                ? format(
                                    new Date(card.last_reviewed),
                                    "MMM d, yyyy"
                                  )
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCardForEdit(card);
                                    setIsAddCardModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={(e) => confirmDeleteCard(card.id, e)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? "No cards match your search"
                      : "No cards in this deck"}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="json" className="mt-0">
                <div className="relative">
                  <div className="flex gap-2 absolute right-2 top-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={copyJsonToClipboard}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <pre
                    className={cn(
                      "p-4 rounded-md bg-gray-50 dark:bg-gray-900 font-mono text-sm overflow-auto",
                      "border border-gray-200 dark:border-gray-700",
                      "max-h-[400px] mt-2"
                    )}
                  >
                    {cardsJson}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddCardModal
        open={isAddCardModalOpen}
        onOpenChange={(open) => {
          setIsAddCardModalOpen(open);
          if (!open) {
            setSelectedCardForEdit(null);
          }
        }}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        defaultDeckId={deckId}
        deckName={deckName}
        availableDecks={[{ id: deckId, name: deckName, categoryName }]}
        editMode={!!selectedCardForEdit}
        initialCard={selectedCardForEdit || undefined}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteCard(cardToDelete as string)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
