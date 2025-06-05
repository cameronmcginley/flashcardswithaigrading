export interface ReorderableDeck {
    id: string;
    name: string;
    categoryId: string;
}

export interface ReorderableCategory {
    id: string;
    name: string;
    decks: ReorderableDeck[];
}

export type SortableItem = {
    id: string;
    type: "category" | "deck";
    label: string;
    categoryId?: string;
    depth: number;
};

export interface SortableItemProps {
    id: string;
    label: string;
    depth?: number;
}
