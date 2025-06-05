
export interface DatabaseDeck {
    id: string;
    category_id: string;
    name: string;
    card_count: number;
}

export interface DatabaseCategory {
    id: string;
    name: string;
}

export interface DatabaseCategoryWithDecks extends DatabaseCategory {
    decks: DatabaseDeck[];
}

export interface UIDeck {
    id: string;
    categoryId: string;
    name: string;
    selected?: boolean;
    cardCount?: number;
}


export interface UICategory {
    id: string;
    name: string;
}

export interface UICategoryWithDecks extends UICategory {
    decks: UIDeck[];
}

export interface UICard {
    id: string;
    deckId: string;
    front: string;
    back: string;
    ease: number;
    review_count: number;
    correct_count: number;
    partial_correct_count: number;
    incorrect_count: number;
    last_reviewed: Date;
}

export type DeleteItem =
    | { type: "category"; id: string; name: string }
    | { type: "deck"; id: string; name: string; categoryId: string };
