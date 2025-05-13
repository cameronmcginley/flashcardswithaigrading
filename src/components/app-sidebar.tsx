import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, MoreVertical } from "lucide-react";
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
}

export function AppSidebar({
  categories,
  onDeckSelect,
  onAddDeck,
  onAddCategory,
  onEditDeck,
  onDeleteDeck,
}: AppSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
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
              onClick={onAddCategory}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
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
                    <div className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md cursor-pointer">
                      <span className="flex items-center gap-2">
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {category.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddDeck(category.id);
                        }}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {category.decks.map((deck) => (
                      <div
                        key={deck.id}
                        className="group flex items-center justify-between gap-2 py-1 px-2"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={deck.selected}
                            onCheckedChange={() =>
                              onDeckSelect(category.id, deck.id)
                            }
                          />
                          <span className="text-sm">{deck.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({deck.cardCount})
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteDeck(category.id, deck.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
