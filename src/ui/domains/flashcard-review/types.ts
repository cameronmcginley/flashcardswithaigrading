
export interface DatabaseDeck {
    id: string;
    name: string;
    card_count: number;
}

export interface DatabaseCategory {
    id: string;
    name: string;
    decks: DatabaseDeck[];
}

export interface UIDeck {
    id: string;
    name: string;
    selected?: boolean;
    cardCount?: number;
}

export interface UICategory {
    id: string;
    name: string;
    decks: UIDeck[];
}

export interface UICard {
    id: string;
    deckId: string;
    question: string;
    answer: string;
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
