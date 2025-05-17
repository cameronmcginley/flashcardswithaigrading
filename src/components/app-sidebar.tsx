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
import AddDeckModal from "@/app/(main-app-page)/app/components/add-deck-modal";
import { Input } from "@/components/ui/input";
import MagicDeckModal from "@/components/magic-deck-modal";
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

// Interface matching the reordering-sidebar structure
interface ReorderableDeck {
  id: string;
  name: string;
  categoryId: string;
}

interface ReorderableCategory {
  id: string;
  name: string;
  decks: ReorderableDeck[];
}

// Define the type for items in the reordering list
type Item = {
  id: string;
  type: "category" | "deck";
  label: string;
  categoryId?: string;
  depth: number;
};

// SortableItem component for drag and drop functionality
interface SortableItemProps {
  id: string;
  label: string;
  depth?: number;
}

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

  // Always maintain item type identity during drag
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Fix height to prevent resizing during drag - height is determined by CSS classes
    height: isCategory ? "40px" : "32px",
    width: isCategory ? "100%" : "calc(100% - 1.5rem)",
    zIndex: isDragging ? 50 : undefined,
    // Use a boxShadow when dragging for better visibility
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
  categories: Category[];
  onDeckSelect: (categoryId: string, deckId: string) => void;
  onAddDeck: (categoryId: string) => void;
  onAddCategory: () => void;
  onEditDeck: (deckId: string, deckName: string, categoryName: string) => void;
  onDeleteDeck: (categoryId: string, deckId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onMagicDeckGenerate?: () => void;
  onAddCard?: (deckId: string, deckName: string, categoryName: string) => void;
  onAddCardGeneral?: () => void;
  onSaveOrder?: (categories: Category[]) => Promise<void>;
}

export function AppSidebar({
  categories,
  onDeckSelect,
  onAddDeck,
  onAddCategory,
  onEditDeck,
  onDeleteDeck,
  onDeleteCategory,
  onMagicDeckGenerate,
  onAddCard,
  onAddCardGeneral,
  onSaveOrder,
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
  const [isReorderingMode, setIsReorderingMode] = useState(false);

  // States for reordering functionality
  const [reorderItems, setReorderItems] = useState<Item[]>([]);

  // Convert the nested structure to a flat list for DnD
  const getItems = (categories: ReorderableCategory[]): Item[] => {
    return categories.flatMap((category) => {
      const categoryItem: Item = {
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

  // Initialize reorder items when entering reordering mode
  const startReordering = () => {
    const reorderableCategories = convertToReorderableCategories(categories);
    setReorderItems(getItems(reorderableCategories));
    setIsReorderingMode(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setReorderItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        const activeItem = prevItems[oldIndex];

        // Prevent moving decks between categories
        if (activeItem.type === "deck") {
          const currentCategoryId = activeItem.categoryId;

          // Don't allow decks to be dragged directly onto category headers
          const overItem = prevItems[newIndex];
          if (overItem.type === "category") {
            return prevItems;
          }

          // Find the category this deck would end up in after move
          let targetCategoryId = null;
          let checkIndex = newIndex;

          // Search backward to find the parent category of the target position
          while (checkIndex >= 0 && !targetCategoryId) {
            const item = prevItems[checkIndex];
            if (item.type === "category") {
              targetCategoryId = item.id.replace("category-", "");
              break;
            }
            checkIndex--;
          }

          // If we're trying to move to a different category, prevent the move
          if (targetCategoryId && targetCategoryId !== currentCategoryId) {
            return prevItems;
          }
        }

        // Create a new array with the moved item
        const newItems = arrayMove(prevItems, oldIndex, newIndex);

        // Ensure item styles and indentation remain consistent after moving
        const updatedItems = newItems.map((item) => {
          // Always preserve item type characteristics
          if (item.type === "deck") {
            // Ensure decks always have depth of 1
            return { ...item, depth: 1 };
          } else {
            // Ensure categories always have depth of 0
            return { ...item, depth: 0 };
          }
        });

        // Ensure no reordering mistakes that could cause items to disappear
        return ensureAllItemsPresent(updatedItems);
      });
    }
  };

  // Ensure all original items are present and properly organized
  const ensureAllItemsPresent = (reorderedItems: Item[]): Item[] => {
    // Make sure all original categories and decks are preserved
    const reorderableCategories = convertToReorderableCategories(categories);
    const originalCategoryIds = reorderableCategories.map(
      (c) => `category-${c.id}`
    );
    const originalDeckIds = reorderableCategories.flatMap((c) =>
      c.decks.map((d) => `deck-${d.id}`)
    );
    const allOriginalIds = new Set([
      ...originalCategoryIds,
      ...originalDeckIds,
    ]);

    // Check if any items are missing from the result
    const resultIds = new Set(reorderedItems.map((item) => item.id));
    const missingItems: Item[] = [];

    // Find any missing items
    for (const id of allOriginalIds) {
      if (!resultIds.has(id)) {
        // Find the original item to restore
        if (id.startsWith("category-")) {
          const categoryId = id.replace("category-", "");
          const category = reorderableCategories.find(
            (c) => c.id === categoryId
          );
          if (category) {
            missingItems.push({
              id,
              type: "category",
              label: category.name,
              depth: 0,
            });
          }
        } else if (id.startsWith("deck-")) {
          const deckId = id.replace("deck-", "");
          for (const category of reorderableCategories) {
            const deck = category.decks.find((d) => d.id === deckId);
            if (deck) {
              missingItems.push({
                id,
                type: "deck",
                label: deck.name,
                categoryId: category.id,
                depth: 1,
              });
              break;
            }
          }
        }
      }
    }

    // If we found missing items, add them back to the result
    if (missingItems.length > 0) {
      console.warn(
        `Found ${missingItems.length} missing items during reordering, restoring them.`
      );
      return updateItemsStructure([...reorderedItems, ...missingItems]);
    }

    // No missing items, but still ensure proper structure
    return updateItemsStructure(reorderedItems);
  };

  // Make sure decks are properly nested under categories after reordering
  const updateItemsStructure = (items: Item[]): Item[] => {
    // First extract all unique categories and decks from the input items
    const categories: Item[] = [];
    const decksByCategory: Record<string, Item[]> = {};

    // Collect all categories
    items.forEach((item) => {
      if (item.type === "category") {
        // Avoid duplicate categories
        const categoryId = item.id.replace("category-", "");
        if (!categories.some((c) => c.id === item.id)) {
          categories.push({ ...item, depth: 0 });
        }

        // Initialize empty array for this category's decks if not exists
        if (!decksByCategory[categoryId]) {
          decksByCategory[categoryId] = [];
        }
      }
    });

    // Now collect all decks and organize them by category
    items.forEach((item) => {
      if (item.type === "deck" && item.categoryId) {
        // Check if this deck is already added to its category
        const isDuplicate = decksByCategory[item.categoryId]?.some(
          (d) => d.id === item.id
        );

        if (!isDuplicate) {
          if (!decksByCategory[item.categoryId]) {
            decksByCategory[item.categoryId] = [];
          }
          decksByCategory[item.categoryId].push({ ...item, depth: 1 });
        }
      }
    });

    // Sort categories based on their position in the items array
    categories.sort((a, b) => {
      const aIndex = items.findIndex((item) => item.id === a.id);
      const bIndex = items.findIndex((item) => item.id === b.id);
      return aIndex - bIndex;
    });

    // Build the final result by placing each deck after its parent category
    const result: Item[] = [];

    categories.forEach((category) => {
      // Add the category
      result.push(category);

      // Add this category's decks
      const categoryId = category.id.replace("category-", "");
      const decksForCategory = decksByCategory[categoryId] || [];

      // Sort decks based on their position in the items array when possible
      decksForCategory.sort((a, b) => {
        const aIndex = items.findIndex((item) => item.id === a.id);
        const bIndex = items.findIndex((item) => item.id === b.id);
        return aIndex - bIndex;
      });

      // Add all decks for this category
      result.push(...decksForCategory);
    });

    return result;
  };

  const saveReordering = () => {
    // Convert flat list back to nested structure
    const updatedCategories: ReorderableCategory[] = [];

    // First create all categories with empty decks arrays
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

    // Then add decks to their respective categories
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
              categoryId: categoryId,
            });
          }
        }
      }
    });

    handleSaveOrder(updatedCategories);
  };

  const cancelReordering = () => {
    setIsReorderingMode(false);
  };

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

  // Convert Category/Deck to ReorderableCategory/ReorderableDeck
  const convertToReorderableCategories = (
    categories: Category[]
  ): ReorderableCategory[] => {
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      decks: category.decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        categoryId: category.id,
      })),
    }));
  };

  // Convert ReorderableCategory/ReorderableDeck back to Category/Deck
  const convertFromReorderableCategories = (
    reorderableCategories: ReorderableCategory[]
  ): Category[] => {
    return reorderableCategories.map((category) => ({
      id: category.id,
      name: category.name,
      decks: category.decks.map((deck) => {
        // Find the original deck to preserve properties like selected and cardCount
        // First check in the original parent category
        const originalCategory = categories.find((c) => c.id === category.id);
        let originalDeck = originalCategory?.decks.find(
          (d) => d.id === deck.id
        );

        // If we didn't find it, the deck might have been moved from another category
        if (!originalDeck) {
          // Look through all categories
          for (const c of categories) {
            const foundDeck = c.decks.find((d) => d.id === deck.id);
            if (foundDeck) {
              originalDeck = foundDeck;
              break;
            }
          }
        }

        return {
          id: deck.id,
          name: deck.name,
          selected: originalDeck?.selected || false,
          cardCount: originalDeck?.cardCount || 0,
        };
      }),
    }));
  };

  const handleSaveOrder = (updatedCategories: ReorderableCategory[]) => {
    if (onSaveOrder) {
      // Convert from reorderable format back to the app format
      const appCategories = convertFromReorderableCategories(updatedCategories);
      onSaveOrder(appCategories)
        .then(() => {
          setIsReorderingMode(false);
        })
        .catch((error) => {
          console.error("Error saving order:", error);
        });
    } else {
      setIsReorderingMode(false);
    }
  };

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
              <Button variant="outline" size="sm" onClick={cancelReordering}>
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
              <TextTooltip
                text="Reorder categories and decks"
                showOnlyIfTruncated={false}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={startReordering}
                >
                  <MoveVertical className="h-4 w-4" />
                  <span className="sr-only">Reorder items</span>
                </Button>
              </TextTooltip>
              <TextTooltip text="Add new category" showOnlyIfTruncated={false}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onAddCategory}
                >
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
