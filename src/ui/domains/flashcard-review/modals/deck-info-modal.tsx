"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash, Check, X, Search, Code, Copy, List, ArrowUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { UICard } from "../types";

interface DeckInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  deckName: string;
  categoryName: string;
  cards: UICard[];
  isLoading: boolean;
  onUpdateDeckName: (deckId: string, newName: string) => Promise<void>;
  onAddCard: (open: boolean) => void;
  onDeleteCard: (open: boolean) => void;
  onUpdateCard: (open: boolean) => void;
  setSelectedCardForEdit: (card: UICard | null) => void;
}

export const DeckInfoModal = ({
  open,
  onOpenChange,
  deckId,
  deckName,
  categoryName,
  cards,
  isLoading,
  onUpdateDeckName,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  setSelectedCardForEdit,
}: DeckInfoModalProps) => {
  const [editingName, setEditingName] = useState(false);
  const [tempDeckName, setTempDeckName] = useState(deckName);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"cards" | "json">("cards");
  const [sortColumn, setSortColumn] = useState<"front" | "ease" | "review_count" | "last_reviewed">("last_reviewed");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  if (deckName !== tempDeckName && !editingName) setTempDeckName(deckName);

  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return !q ? cards : cards.filter((c) => c.front.toLowerCase().includes(q));
  }, [cards, searchQuery]);

  const sortedCards = useMemo(() => {
    const arr = [...filteredCards];
    arr.sort((a, b) => {
      if (sortColumn === "front") return sortDirection === "asc" ? a.front.localeCompare(b.front) : b.front.localeCompare(a.front);
      if (sortColumn === "ease") return sortDirection === "asc" ? (a.ease ?? 0) - (b.ease ?? 0) : (b.ease ?? 0) - (a.ease ?? 0);
      if (sortColumn === "review_count") return sortDirection === "asc" ? (a.review_count ?? 0) - (b.review_count ?? 0) : (b.review_count ?? 0) - (a.review_count ?? 0);
      // last_reviewed
      const aDate = a.last_reviewed ? new Date(a.last_reviewed) : new Date(0);
      const bDate = b.last_reviewed ? new Date(b.last_reviewed) : new Date(0);
      return sortDirection === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    });
    return arr;
  }, [filteredCards, sortColumn, sortDirection]);

  const toggleSort = (column: typeof sortColumn) => {
    setSortDirection(sortColumn === column && sortDirection === "asc" ? "desc" : "asc");
    setSortColumn(column);
  };

  const cardsJson = useMemo(
    () => JSON.stringify(cards.map(({ front, back }) => ({ front, back })), null, 2),
    [cards]
  );

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(cardsJson);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {editingName ? (
                <>
                  <Input
                    value={tempDeckName}
                    onChange={(e) => setTempDeckName(e.target.value)}
                    className="h-9 text-lg font-semibold"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (tempDeckName.trim()) {
                        onUpdateDeckName(deckId, tempDeckName.trim());
                        setEditingName(false);
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingName(false);
                    setTempDeckName(deckName);
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <DialogTitle className="text-xl">{deckName}</DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setTempDeckName(deckName);
                      setEditingName(true);
                    }}
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
            <Button onClick={() => { setSelectedCardForEdit(null); onAddCard(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">
                {filteredCards.length} {filteredCards.length === 1 ? "Card" : "Cards"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setCurrentView(currentView === "cards" ? "json" : "cards")}
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
            <Tabs value={currentView} onValueChange={v => setCurrentView(v as "cards" | "json")}>
              <TabsList className="hidden">
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="cards" className="mt-0">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading cards...</div>
                ) : sortedCards.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Button variant="ghost" onClick={() => toggleSort("front")} className="h-8 text-left font-medium">
                              Front
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" onClick={() => toggleSort("ease")} className="h-8 text-left font-medium">
                              Ease
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" onClick={() => toggleSort("review_count")} className="h-8 text-left font-medium">
                              Reviews
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" onClick={() => toggleSort("last_reviewed")} className="h-8 text-left font-medium">
                              Last Reviewed
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedCards.map((card) => (
                          <TableRow key={card.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="truncate max-w-[300px]">{card.front}</p>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-md">
                                    <p>{card.front}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>{card.ease?.toFixed(2) ?? "N/A"}</TableCell>
                            <TableCell>{card.review_count ?? 0}</TableCell>
                            <TableCell>
                              {card.last_reviewed ? new Date(card.last_reviewed).toLocaleDateString() : "Never"}
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
                                    onUpdateCard(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCardForEdit(card);
                                    onDeleteCard(true);
                                  }}
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
                    {searchQuery ? "No cards match your search" : "No cards in this deck"}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="json" className="mt-0">
                <div className="relative">
                  <div className="flex gap-2 absolute right-2 top-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={copyJsonToClipboard}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <pre className={cn("p-4 rounded-md bg-gray-50 dark:bg-gray-900 font-mono text-sm overflow-auto", "border border-gray-200 dark:border-gray-700", "max-h-[400px] mt-2")}>
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
    </>
  );
};
