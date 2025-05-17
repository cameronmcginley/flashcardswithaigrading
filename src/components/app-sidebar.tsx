import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Check,
  X,
  Sparkles,
  Plus,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import AddDeckModal from "@/app/(main-app-page)/app/components/add-deck-modal";
import { Input } from "@/components/ui/input";
import MagicDeckModal from "@/components/magic-deck-modal";
import { TextTooltip } from "@/components/ui/text-tooltip";
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

interface AppSidebarProps {
  categories: Category[];
  onDeckSelect: (categoryId: string, deckId: string) => void;
  onAddDeck: (categoryId: string) => void;
  onAddCategory: () => void;
  onEditDeck: (deckId: string, deckName: string, categoryName: string) => void;
  onDeleteDeck: (categoryId: string, deckId: string) => void;
  onMagicDeckGenerate?: () => void;
  onAddCard?: (deckId: string, deckName: string, categoryName: string) => void;
  onAddCardGeneral?: () => void;
}

export function AppSidebar({
  categories,
  onDeckSelect,
  onAddDeck,
  onAddCategory,
  onEditDeck,
  onDeleteDeck,
  onMagicDeckGenerate,
  onAddCard,
  onAddCardGeneral,
}: AppSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [isMagicDeckModalOpen, setIsMagicDeckModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isFabExpanded, setIsFabExpanded] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddDeckClick = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategoryId(categoryId);
    setIsAddDeckModalOpen(true);
  };

  const handleAddCardClick = (
    categoryId: string,
    deckId: string,
    deckName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (onAddCard) {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        onAddCard(deckId, deckName, category.name);
      }
    }
  };

  const startEditingCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setEditingCategory(categoryId);
      setEditName(category.name);
    }
  };

  const saveEditingCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingCategory && editName.trim()) {
      // TODO: Implement save category name
      console.log("Save category name", editingCategory, editName.trim());
      setEditingCategory(null);
    }
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(null);
  };

  const handleMagicDeckGenerate = (
    categoryId: string,
    deckName: string,
    prompt: string
  ) => {
    if (onMagicDeckGenerate) {
      onMagicDeckGenerate();
      // You might want to pass these parameters to the parent component
      console.log("Generating deck:", { categoryId, deckName, prompt });
    }
  };

  return (
    <Sidebar variant="floating" className="h-full">
      <div className="flex h-full flex-col">
        <SidebarHeader className="border-b shrink-0">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-semibold">Categories</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onAddCategory}
              title="Add new category"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add category</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarMenu className="p-2">
            {categories.map((category) => (
              <Collapsible
                key={category.id}
                open={expandedCategories.includes(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <div className="flex items-center w-full">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md cursor-pointer group">
                      <span className="flex items-center gap-2 flex-1 min-w-0">
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                        {editingCategory === category.id ? (
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-7 text-sm"
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={saveEditingCategory}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <TextTooltip
                            text={category.name}
                            className="flex-1 min-w-0"
                          >
                            <span className="truncate">{category.name}</span>
                          </TextTooltip>
                        )}
                      </span>
                      {!editingCategory && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddDeckClick(category.id, e);
                              }}
                            >
                              Add Deck
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) =>
                                startEditingCategory(category.id, e)
                              }
                            >
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement delete category
                                console.log("Delete category", category.id);
                              }}
                              className="text-destructive"
                            >
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SidebarMenuSub className="mx-0 px-0 border-none">
                    {category.decks.map((deck) => (
                      <div
                        key={deck.id}
                        className="group flex items-center justify-between gap-4 py-1 px-2 ml-6"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Checkbox
                            checked={deck.selected}
                            onCheckedChange={() =>
                              onDeckSelect(category.id, deck.id)
                            }
                            className="shrink-0"
                          />
                          <div className="flex items-center min-w-0">
                            <TextTooltip
                              text={`${deck.name} (${deck.cardCount})`}
                              className="flex-1 min-w-0"
                            >
                              <div className="truncate">
                                <span className="text-sm">{deck.name}</span>
                              </div>
                            </TextTooltip>
                            <span className="text-xs text-muted-foreground ml-2 mb-0.5 self-end">
                              ({deck.cardCount})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          {onAddCard && (
                            <TextTooltip
                              text="Add card to this deck"
                              showOnlyIfTruncated={false}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) =>
                                  handleAddCardClick(
                                    category.id,
                                    deck.id,
                                    deck.name,
                                    e
                                  )
                                }
                              >
                                <FilePlus className="h-3 w-3 text-primary" />
                              </Button>
                            </TextTooltip>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  onEditDeck(deck.id, deck.name, category.name)
                                }
                              >
                                Edit Deck
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onDeleteDeck(category.id, deck.id)
                                }
                                className="text-destructive"
                              >
                                Delete Deck
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}

                    {/* Add Deck Button */}
                    <div
                      className="group flex items-center justify-between gap-2 py-1 px-2 ml-6 hover:bg-accent/50 rounded-md cursor-pointer"
                      onClick={(e) => handleAddDeckClick(category.id, e)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary shrink-0">
                          <Plus className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-primary">Add Deck</span>
                      </div>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarContent>

        {/* Add Content Button & Options */}
        <div className="px-4 pb-2">
          <div className="relative">
            {/* Add Options - only visible when expanded */}
            <div
              className={cn(
                "mb-2 flex flex-col rounded-lg border bg-card overflow-hidden transition-all duration-200",
                isFabExpanded
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              )}
            >
              <TextTooltip
                text="Create a new category"
                showOnlyIfTruncated={false}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  className="justify-start rounded-none h-10 px-4 py-2 text-sm font-medium"
                  onClick={() => {
                    onAddCategory();
                    setIsFabExpanded(false);
                  }}
                >
                  Add Category
                </Button>
              </TextTooltip>
              <TextTooltip
                text="Create a new deck in a category"
                showOnlyIfTruncated={false}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  className="justify-start rounded-none h-10 px-4 py-2 text-sm font-medium"
                  onClick={() => {
                    if (categories.length > 0) {
                      setSelectedCategoryId(categories[0].id);
                      setIsAddDeckModalOpen(true);
                    }
                    setIsFabExpanded(false);
                  }}
                >
                  Add Deck
                </Button>
              </TextTooltip>
              <TextTooltip
                text="Add a new flashcard to a deck"
                showOnlyIfTruncated={false}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  className="justify-start rounded-none h-10 px-4 py-2 text-sm font-medium"
                  onClick={() => {
                    if (onAddCardGeneral) {
                      onAddCardGeneral();
                    }
                    setIsFabExpanded(false);
                  }}
                  disabled={!onAddCardGeneral}
                >
                  Add Card
                </Button>
              </TextTooltip>
            </div>

            {/* Main FAB button */}
            <Button
              className={cn(
                "w-full transition-all duration-300 flex items-center justify-center gap-2",
                isFabExpanded
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
              onClick={() => setIsFabExpanded(!isFabExpanded)}
            >
              <Plus
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isFabExpanded ? "rotate-45" : ""
                )}
              />
              <span>{isFabExpanded ? "Close" : "Add Content"}</span>
            </Button>
          </div>
        </div>

        {/* Add Magic Deck Generator button */}
        <div className="p-4 pt-2 border-t">
          <TextTooltip
            text="Generate a deck with AI assistance"
            showOnlyIfTruncated={false}
            className="w-full"
          >
            <Button
              onClick={() => setIsMagicDeckModalOpen(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Magic Deck Generator
            </Button>
          </TextTooltip>
        </div>
      </div>

      {/* Add Deck Modal */}
      <AddDeckModal
        open={isAddDeckModalOpen}
        onOpenChange={setIsAddDeckModalOpen}
        onAddDeck={(name) => {
          if (selectedCategoryId && name) {
            onAddDeck(selectedCategoryId);
            setIsAddDeckModalOpen(false);
          }
        }}
        categoryId={selectedCategoryId || ""}
        categoryName={
          categories.find((c) => c.id === selectedCategoryId)?.name || ""
        }
        categories={categories}
        onCategoryChange={setSelectedCategoryId}
      />

      {/* Magic Deck Modal */}
      <MagicDeckModal
        open={isMagicDeckModalOpen}
        onOpenChange={setIsMagicDeckModalOpen}
        onGenerate={handleMagicDeckGenerate}
        categories={categories}
      />
    </Sidebar>
  );
}
