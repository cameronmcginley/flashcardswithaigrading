import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Check,
  X,
  Sparkles,
  Brain,
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
import QuizModal from "@/components/quiz-modal";

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
}

export function AppSidebar({
  categories,
  onDeckSelect,
  onAddDeck,
  onAddCategory,
  onEditDeck,
  onDeleteDeck,
  onMagicDeckGenerate,
}: AppSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [isMagicDeckModalOpen, setIsMagicDeckModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAddCategory}>
                  New Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
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
                          <span className="truncate">{category.name}</span>
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
                        className="group flex items-center justify-between gap-2 py-1 px-2 ml-6"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Checkbox
                            checked={deck.selected}
                            onCheckedChange={() =>
                              onDeckSelect(category.id, deck.id)
                            }
                          />
                          <span className="text-sm truncate">{deck.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({deck.cardCount})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  onEditDeck(deck.id, deck.name, category.name)
                                }
                              >
                                Edit Deck / Add Cards
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
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarContent>

        {/* Add Magic Deck Generator button */}
        <div className="p-4 border-t">
          <Button
            onClick={() => setIsMagicDeckModalOpen(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Magic Deck Generator
          </Button>
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

      <div className="p-4 border-t space-y-2">
        <Button
          onClick={() => setIsQuizModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Brain className="h-4 w-4" />
          <span>Take a Quiz</span>
        </Button>
      </div>

      <QuizModal
        open={isQuizModalOpen}
        onOpenChange={setIsQuizModalOpen}
        categories={categories}
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
