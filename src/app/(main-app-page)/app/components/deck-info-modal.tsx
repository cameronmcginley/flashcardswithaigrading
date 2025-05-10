"use client";

import type React from "react";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import CardDetailModal from "./card-detail-modal";
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

interface Card {
  id: string;
  question: string;
  answer: string;
}

interface DeckInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  deckName: string;
  categoryName: string;
  onUpdateDeckName: (newName: string) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateCard: (cardId: string, question: string, answer: string) => void;
  onAddCard: () => void;
}

export default function DeckInfoModal({
  open,
  onOpenChange,
  deckId,
  deckName,
  categoryName,
  onUpdateDeckName,
  onDeleteCard,
  onUpdateCard,
  onAddCard,
}: DeckInfoModalProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempDeckName, setTempDeckName] = useState(deckName);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [currentView, setCurrentView] = useState<"cards" | "json">("cards");
  const [jsonCopied, setJsonCopied] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Add a state for editing JSON
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [editedJson, setEditedJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Mock cards data - in a real app, this would be fetched based on deckId
  const [cards, setCards] = useState<Card[]>([
    {
      id: "1",
      question: "What is a closure in JavaScript?",
      answer:
        "A closure is a function that has access to its own scope, the scope of the outer function, and the global scope.",
    },
    {
      id: "2",
      question: "What is the difference between let and var in JavaScript?",
      answer:
        "let is block-scoped while var is function-scoped. let was introduced in ES6.",
    },
    {
      id: "3",
      question: "Explain the concept of hoisting in JavaScript.",
      answer:
        "Hoisting is JavaScript's default behavior of moving declarations to the top of the current scope. Variables declared with var are hoisted and initialized with undefined, while let and const are hoisted but not initialized.",
    },
    {
      id: "4",
      question: "What is the event loop in JavaScript?",
      answer:
        "The event loop is a mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It monitors the call stack and the callback queue, and when the call stack is empty, it pushes the first callback from the queue to the stack for execution.",
    },
    {
      id: "5",
      question: "What is the difference between == and === in JavaScript?",
      answer:
        "== is the equality operator that converts the operands to the same type before comparison, while === is the strict equality operator that checks both value and type without conversion.",
    },
  ]);

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

  const openCardDetail = (card: Card) => {
    setSelectedCard(card);
    setIsCardDetailOpen(true);
  };

  const confirmDeleteCard = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardToDelete(cardId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCard = () => {
    if (!cardToDelete) return;

    // Update the local state
    setCards(cards.filter((card) => card.id !== cardToDelete));

    // Call the parent handler
    onDeleteCard(cardToDelete);
    setIsDeleteDialogOpen(false);
    setCardToDelete(null);
    toast.success("Card deleted");
    // Removed the onOpenChange(false) line that was closing the main modal
  };

  const handleUpdateCard = (
    cardId: string,
    question: string,
    answer: string
  ) => {
    // Update the card in the local state
    setCards(
      cards.map((card) => {
        if (card.id === cardId) {
          return { ...card, question, answer };
        }
        return card;
      })
    );

    // Call the parent handler
    onUpdateCard(cardId, question, answer);
    toast.success("Card updated");
  };

  // Filter cards based on search query
  const filteredCards = searchQuery
    ? cards.filter((card) =>
        card.question.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cards;

  // Generate JSON representation of cards
  const cardsJson = JSON.stringify(
    cards.map(({ id, question, answer }) => ({
      question,
      answer,
    })),
    null,
    2
  );

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(cardsJson).then(
      () => {
        setJsonCopied(true);
        toast.success("JSON copied to clipboard");
        setTimeout(() => setJsonCopied(false), 2000);
      },
      () => {
        toast.error("Failed to copy JSON");
      }
    );
  };

  const startEditingJson = () => {
    setEditedJson(cardsJson);
    setIsEditingJson(true);
    setJsonError(null);
  };

  const cancelEditingJson = () => {
    setIsEditingJson(false);
    setJsonError(null);
  };

  const saveEditedJson = () => {
    try {
      const parsedCards = JSON.parse(editedJson);

      // Validate the structure
      if (!Array.isArray(parsedCards)) {
        setJsonError("JSON must be an array of cards");
        return;
      }

      // Check if each card has question and answer
      const isValid = parsedCards.every(
        (card) =>
          typeof card === "object" &&
          card !== null &&
          typeof card.question === "string" &&
          typeof card.answer === "string"
      );

      if (!isValid) {
        setJsonError("Each card must have 'question' and 'answer' fields");
        return;
      }

      // Update the cards in the local state
      const updatedCards = parsedCards.map((card, index) => ({
        id: cards[index]?.id || `new-${Date.now()}-${index}`,
        question: card.question,
        answer: card.answer,
      }));

      setCards(updatedCards);
      setIsEditingJson(false);
      setJsonError(null);
      toast.success("Cards updated successfully");
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
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
            <Button onClick={onAddCard}>
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
                {filteredCards.length > 0 ? (
                  <div className="space-y-2">
                    <TooltipProvider>
                      {filteredCards.map((card) => (
                        <div
                          key={card.id}
                          className="group relative p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => openCardDetail(card)}
                        >
                          <div className="pr-16">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="truncate">{card.question}</p>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="max-w-md"
                              >
                                <p>{card.question}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCardDetail(card);
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
                        </div>
                      ))}
                    </TooltipProvider>
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
                  {isEditingJson ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-800 dark:text-yellow-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="flex-shrink-0"
                        >
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                          <path d="M12 9v4"></path>
                          <path d="M12 17h.01"></path>
                        </svg>
                        <span className="text-sm">
                          Warning: Bulk editing will reset all card statistics
                          (ease factor, review history, etc.)
                        </span>
                      </div>
                      <div className="relative">
                        <textarea
                          value={editedJson}
                          onChange={(e) => setEditedJson(e.target.value)}
                          className={cn(
                            "w-full h-[400px] p-4 font-mono text-sm rounded-md border",
                            "bg-gray-50 dark:bg-gray-900",
                            jsonError
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          )}
                        />
                        {jsonError && (
                          <p className="text-sm text-red-500 mt-1">
                            {jsonError}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditingJson}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEditedJson}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 absolute right-2 top-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={startEditingJson}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={copyJsonToClipboard}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {jsonCopied ? "Copied!" : "Copy"}
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
                    </>
                  )}
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

      {selectedCard && (
        <CardDetailModal
          open={isCardDetailOpen}
          onOpenChange={setIsCardDetailOpen}
          card={selectedCard}
          onUpdate={(question, answer) =>
            handleUpdateCard(selectedCard.id, question, answer)
          }
          onDelete={() =>
            confirmDeleteCard(selectedCard.id, {} as React.MouseEvent)
          }
        />
      )}

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
              onClick={handleDeleteCard}
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
