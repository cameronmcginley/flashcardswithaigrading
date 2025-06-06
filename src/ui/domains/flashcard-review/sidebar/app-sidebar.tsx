import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Check,
  X,
  Sparkles,
  Plus,
  MoveVertical,
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
import { LoadingSidebar } from "./loading-sidebar";
import { Input } from "@/components/ui/input";
import { TextTooltip } from "@/components/ui/text-tooltip";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReorderableCategory, SortableItemProps, SortableItem } from "./types";
import { UICategoryWithDecks } from "../types";

// SortableItem for DnD
function SortableItem({ id, label, depth = 0 }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const isCategory = !id.includes("deck-");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: isCategory ? "40px" : "32px",
    width: isCategory ? "100%" : "calc(100% - 1.5rem)",
    zIndex: isDragging ? 50 : undefined,
    boxShadow: isDragging ? "0 4px 8px rgba(0, 0, 0, 0.1)" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center mb-1 rounded-md cursor-grab active:cursor-grabbing transition-colors",
        isCategory
          ? "p-2 hover:bg-accent hover:text-accent-foreground font-medium"
          : "py-1 px-2 hover:bg-accent/50 text-sm",
        depth > 0 && "ml-6",
        isDragging &&
          isCategory &&
          "bg-accent opacity-90 border border-accent-foreground/20",
        isDragging &&
          !isCategory &&
          "bg-accent/50 opacity-90 border border-accent-foreground/10"
      )}
    >
      <MoveVertical className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
      <span className={cn("truncate", "w-full")}>{label}</span>
    </div>
  );
}

interface AppSidebarProps {
  categories: UICategoryWithDecks[];
  isLoading: boolean;

  // Handler props for parent-driven actions
  onAddCategory: () => void;
  onAddDeck: (categoryId: string) => void;
  onEditCategory: (categoryId: string, newName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeckSelect: (categoryId: string, deckId: string) => void;
  onEditDeck: (deckId: string, categoryId: string) => void;
  onDeleteDeck: (deckId: string, categoryId: string) => void;
  onFabAddCard: () => void;
  onMagicDeck: () => void;
  onSaveOrder: (categories: UICategoryWithDecks[]) => void;
}

// Pure presentational sidebar, all logic/state driven via props
export function AppSidebar({
  categories,
  isLoading,
  onAddCategory,
  onAddDeck,
  onEditCategory,
  onDeleteCategory,
  onDeckSelect,
  onEditDeck,
  onDeleteDeck,
  onFabAddCard,
  onMagicDeck,
  onSaveOrder,
}: AppSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isReorderingMode, setIsReorderingMode] = useState(false);
  const [reorderItems, setReorderItems] = useState<SortableItem[]>([]);

  // DnD logic
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Nested->flat
  const getItems = (categories: ReorderableCategory[]): SortableItem[] => {
    return categories.flatMap((category) => {
      const categoryItem: SortableItem = {
        id: `category-${category.id}`,
        type: "category",
        label: category.name,
        depth: 0,
      };
      const deckItems = category.decks.map((deck) => ({
        id: `deck-${deck.id}`,
        type: "deck" as const,
        label: deck.name,
        categoryId: category.id,
        depth: 1,
      }));
      return [categoryItem, ...deckItems];
    });
  };

  const convertToReorderableCategories = (categories: UICategoryWithDecks[]): ReorderableCategory[] =>
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      decks: category.decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        categoryId: category.id,
      })),
    }));

  const convertFromReorderableCategories = (
    reorderableCategories: ReorderableCategory[]
  ): UICategoryWithDecks[] =>
    reorderableCategories.map((category) => ({
      id: category.id,
      name: category.name,
      decks: category.decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        categoryId: category.id,
      })),
    }));

  // DnD handlers
  const startReordering = () => {
    setReorderItems(getItems(convertToReorderableCategories(categories)));
    setIsReorderingMode(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setReorderItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        // Only reorder within same category for decks
        const activeItem = prevItems[oldIndex];
        if (activeItem.type === "deck") {
          let checkIndex = newIndex;
          let targetCategoryId: string | null = null;
          while (checkIndex >= 0 && !targetCategoryId) {
            const item = prevItems[checkIndex];
            if (item.type === "category") {
              targetCategoryId = item.id.replace("category-", "");
              break;
            }
            checkIndex--;
          }
          if (targetCategoryId && targetCategoryId !== activeItem.categoryId) return prevItems;
        }
        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  };

  const saveReordering = () => {
    const updatedCategories: ReorderableCategory[] = [];
    reorderItems.forEach((item) => {
      if (item.type === "category") {
        const categoryId = item.id.replace("category-", "");
        updatedCategories.push({
          id: categoryId,
          name: item.label,
          decks: [],
        });
      }
    });
    reorderItems.forEach((item) => {
      if (item.type === "deck") {
        const deckId = item.id.replace("deck-", "");
        const categoryId = item.categoryId;
        if (categoryId) {
          const targetCategory = updatedCategories.find(
            (c) => c.id === categoryId
          );
          if (targetCategory) {
            targetCategory.decks.push({
              id: deckId,
              name: item.label,
              categoryId,
            });
          }
        }
      }
    });
    const asAppCategories = convertFromReorderableCategories(updatedCategories);
    onSaveOrder(asAppCategories);
    setIsReorderingMode(false);
  };

  if (isLoading) return <LoadingSidebar />;

  if (isReorderingMode) {
    return (
      <Sidebar variant="floating" className="h-full">
        <div className="flex h-full flex-col">
          <div className="p-4 border-b shrink-0">
            <h2 className="text-lg font-semibold mb-3">Reorder Items</h2>
            <div className="flex flex-col gap-2">
              <Button variant="default" size="sm" onClick={saveReordering}>
                <Check className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsReorderingMode(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Drag items to reorder categories and decks.
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={reorderItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {reorderItems.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    depth={item.depth}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar variant="floating" className="h-full">
      <div className="flex h-full flex-col">
        <SidebarHeader className="border-b shrink-0">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-semibold">Categories</h2>
            <div className="flex">
              <TextTooltip text="Reorder categories and decks" showOnlyIfTruncated={false}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startReordering}>
                  <MoveVertical className="h-4 w-4" />
                  <span className="sr-only">Reorder items</span>
                </Button>
              </TextTooltip>
              <TextTooltip text="Add new category" showOnlyIfTruncated={false}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddCategory}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add category</span>
                </Button>
              </TextTooltip>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarMenu className="p-2">
            {categories.map((category) => (
              <Collapsible
                key={category.id}
                open={expandedCategories.includes(category.id)}
                onOpenChange={() =>
                  setExpandedCategories((prev) =>
                    prev.includes(category.id)
                      ? prev.filter((id) => id !== category.id)
                      : [...prev, category.id]
                  )
                }
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditCategory(category.id, editName.trim());
                                setEditingCategory(null);
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategory(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <TextTooltip text={category.name} className="flex-1 min-w-0">
                            <span className="truncate">{category.name}</span>
                          </TextTooltip>
                        )}
                      </span>
                      {!editingCategory && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100 cursor-pointer inline-flex items-center justify-center rounded-sm hover:bg-accent hover:bg-opacity-70 z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                              <span className="sr-only">More options</span>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddDeck(category.id);
                              }}
                            >
                              Add Deck
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategory(category.id);
                                setEditName(category.name);
                              }}
                            >
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCategory(category.id);
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
                            checked={!!deck.selected}
                            onCheckedChange={() =>
                              onDeckSelect(category.id, deck.id)
                            }
                            className="shrink-0"
                          />
                          <div className="flex items-center min-w-0">
                            <TextTooltip
                              text={`${deck.name} (${deck.cardCount ?? ""})`}
                              className="flex-1 min-w-0"
                            >
                              <div className="truncate">
                                <span className="text-sm">{deck.name}</span>
                              </div>
                            </TextTooltip>
                            <span className="text-xs text-muted-foreground ml-2 mb-0.5 self-end">
                              ({deck.cardCount ?? ""})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100 cursor-pointer inline-flex items-center justify-center rounded-sm hover:bg-accent hover:bg-opacity-70 z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                                <span className="sr-only">More options</span>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onEditDeck(deck.id, category.id)}
                              >
                                Edit Deck
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDeleteDeck(deck.id, category.id)}
                                className="text-destructive"
                              >
                                Delete Deck
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    <div
                      className="group flex items-center justify-between gap-2 py-1 px-2 ml-6 hover:bg-accent/50 rounded-md cursor-pointer"
                      onClick={() => onAddDeck(category.id)}
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
            <div
              className={cn(
                "mb-2 flex flex-col rounded-lg border bg-card overflow-hidden transition-all duration-200",
                isFabExpanded
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              )}
            >
              <TextTooltip text="Create a new category" showOnlyIfTruncated={false} className="w-full">
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
              <TextTooltip text="Create a new deck in a category" showOnlyIfTruncated={false} className="w-full">
                <Button
                  variant="ghost"
                  className="justify-start rounded-none h-10 px-4 py-2 text-sm font-medium"
                  onClick={() => {
                    if (categories.length > 0) {
                      onAddDeck(categories[0].id);
                    }
                    setIsFabExpanded(false);
                  }}
                >
                  Add Deck
                </Button>
              </TextTooltip>
              <TextTooltip text="Add a new flashcard to a deck" showOnlyIfTruncated={false} className="w-full">
                <Button
                  variant="ghost"
                  className="justify-start rounded-none h-10 px-4 py-2 text-sm font-medium"
                  onClick={() => {
                    onFabAddCard();
                    setIsFabExpanded(false);
                  }}
                >
                  Add Card
                </Button>
              </TextTooltip>
            </div>
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
        {/* Magic Deck Generator */}
        <div className="p-4 pt-2 border-t">
          <TextTooltip
            text="Generate a deck with AI assistance"
            showOnlyIfTruncated={false}
            className="w-full"
          >
            <Button
              onClick={onMagicDeck}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Deck Generator
            </Button>
          </TextTooltip>
        </div>
      </div>
    </Sidebar>
  );
}
