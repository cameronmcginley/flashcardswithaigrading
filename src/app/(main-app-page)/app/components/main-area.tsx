"use client";

import { useState, useEffect } from "react";
import Flashcard from "./flashcard";
import AddCardModal from "./add-card-modal";
import DeleteConfirmationModal from "./delete-confirmation-modal";
import { toast } from "sonner";
import {
  getAllCardsInDeck,
  markCardCorrect,
  markCardPartiallyCorrect,
  markCardIncorrect,
} from "@/features/cards/card";
import { sortCardsToReview } from "@/features/cards/sorting";
import {
  ClipboardList,
  BookOpen,
  LayoutGrid,
  ArrowRightLeft,
} from "lucide-react";

interface UICard {
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

interface MainAreaProps {
  selectedDecks?: { deckId: string; cardCount: number }[];
  debugMode?: boolean;
}

// Circular queue to store card history
class CardHistory {
  private items: UICard[];
  private maxSize: number;
  private currentIndex: number;
  private size: number;

  constructor(maxSize: number) {
    this.items = new Array(maxSize);
    this.maxSize = maxSize;
    this.currentIndex = -1;
    this.size = 0;
  }

  push(card: UICard) {
    this.currentIndex = (this.currentIndex + 1) % this.maxSize;
    this.items[this.currentIndex] = card;
    this.size = Math.min(this.size + 1, this.maxSize);
  }

  previous(): UICard | undefined {
    if (this.size <= 1) return undefined;
    this.currentIndex = (this.currentIndex - 1 + this.maxSize) % this.maxSize;
    return this.items[this.currentIndex];
  }

  canGoBack(): boolean {
    return this.size > 1 && this.currentIndex > 0;
  }

  clear() {
    this.items = new Array(this.maxSize);
    this.currentIndex = -1;
    this.size = 0;
  }
}

export default function MainArea({ selectedDecks = [] }: MainAreaProps) {
  const [cards, setCards] = useState<UICard[]>([]);
  const [filteredCards, setFilteredCards] = useState<UICard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cardHistory] = useState(() => new CardHistory(10));

  // Load and sort cards when selected decks change
  useEffect(() => {
    const loadCards = async () => {
      if (selectedDecks.length === 0) {
        setCards([]);
        setFilteredCards([]);
        cardHistory.clear();
        return;
      }

      setIsLoading(true);
      try {
        // Fetch cards for all selected decks
        const allCards = await Promise.all(
          selectedDecks.map((deck) => getAllCardsInDeck(deck.deckId))
        );

        // Transform and combine all cards
        const transformedCards: UICard[] = allCards.flat().map((card) => ({
          id: card.id,
          deckId: card.deck_id,
          question: card.front,
          answer: card.back,
          ease: card.ease,
          review_count: card.review_count,
          correct_count: card.correct_count,
          partial_correct_count: card.partial_correct_count,
          incorrect_count: card.incorrect_count,
          last_reviewed: card.last_reviewed,
        }));

        // Sort cards by priority
        const sortedCards = sortCardsToReview(transformedCards);

        setCards(transformedCards);
        setFilteredCards(sortedCards);
        setCurrentCardIndex(0);
        cardHistory.clear();
        if (sortedCards.length > 0) {
          cardHistory.push(sortedCards[0]);
        }
      } catch (error) {
        console.error("Error loading cards:", error);
        toast.error("Failed to load cards");
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [selectedDecks]);

  const currentCard = filteredCards[currentCardIndex];

  const handleNextCard = () => {
    if (filteredCards.length > 0) {
      // Sort all cards again - the jitter in the sorting algorithm
      // helps prevent the same card from appearing first twice in a row
      const sortedCards = sortCardsToReview(filteredCards);
      setFilteredCards(sortedCards);
      setCurrentCardIndex(0);
      setCardKey((prev) => prev + 1);
      cardHistory.push(sortedCards[0]);
    }
  };

  const handlePrevCard = () => {
    const previousCard = cardHistory.previous();
    if (previousCard) {
      // Find the index of the previous card in the current filtered cards
      const index = filteredCards.findIndex(
        (card) => card.id === previousCard.id
      );
      if (index !== -1) {
        setCurrentCardIndex(index);
        setCardKey((prev) => prev + 1);
      }
    }
  };

  const handleAnswered = () => {
    // This is called when a card is flipped, but we don't need to do anything
  };

  const handleAddCard = (front: string, back: string, deckId: string) => {
    const newCard = {
      id: `${Date.now()}`,
      deckId,
      question: front,
      answer: back,
      ease: 2.5,
      review_count: 0,
      correct_count: 0,
      partial_correct_count: 0,
      incorrect_count: 0,
      last_reviewed: new Date(),
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);

    if (selectedDecks.some((deck) => deck.deckId === deckId)) {
      setFilteredCards([...filteredCards, newCard]);
      setCurrentCardIndex(filteredCards.length);
    }

    setIsAddCardModalOpen(false);
  };

  const handleAddMultipleCards = (
    newCards: Array<{ front: string; back: string }>,
    deckId: string
  ) => {
    const cardsToAdd = newCards.map((card, index) => ({
      id: `${Date.now()}-${index}`,
      deckId,
      question: card.front,
      answer: card.back,
      ease: 2.5,
      review_count: 0,
      correct_count: 0,
      partial_correct_count: 0,
      incorrect_count: 0,
      last_reviewed: new Date(),
    }));

    const updatedCards = [...cards, ...cardsToAdd];
    setCards(updatedCards);

    if (selectedDecks.some((deck) => deck.deckId === deckId)) {
      setFilteredCards([...filteredCards, ...cardsToAdd]);
      setCurrentCardIndex(filteredCards.length);
    }

    setIsAddCardModalOpen(false);
  };

  const handleDeleteCard = () => {
    if (filteredCards.length <= 1) return;

    const updatedFilteredCards = filteredCards.filter(
      (_, index) => index !== currentCardIndex
    );
    const updatedCards = cards.filter((card) => card.id !== currentCard.id);

    setCards(updatedCards);
    setFilteredCards(updatedFilteredCards);
    setCurrentCardIndex(
      Math.min(currentCardIndex, updatedFilteredCards.length - 1)
    );
    setIsDeleteModalOpen(false);
  };

  const handleUpdateCard = (question: string, answer: string) => {
    if (!currentCard) return;

    const updatedCards = cards.map((card) => {
      if (card.id === currentCard.id) {
        return { ...card, question, answer };
      }
      return card;
    });

    setCards(updatedCards);

    const updatedFilteredCards = filteredCards.map((card, index) => {
      if (index === currentCardIndex) {
        return { ...card, question, answer };
      }
      return card;
    });

    setFilteredCards(updatedFilteredCards);
  };

  const getAvailableDecks = () => {
    return selectedDecks.map((deck) => ({
      id: deck.deckId,
      name: "Selected Deck", // TODO: Get actual deck names
      categoryName: "Category", // TODO: Get actual category names
    }));
  };

  const handleCorrect = async () => {
    if (!currentCard) return;

    try {
      // Update card stats in the database
      const updatedCard = await markCardCorrect(currentCard.id);

      // Update the card in our local state with the new stats
      const updatedCards = cards.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              ease: updatedCard.ease,
              review_count: updatedCard.review_count,
              correct_count: updatedCard.correct_count,
              incorrect_count: updatedCard.incorrect_count,
              last_reviewed: updatedCard.last_reviewed,
            }
          : card
      );
      setCards(updatedCards);

      // Also update the card in filteredCards to ensure proper sorting
      const updatedFilteredCards = filteredCards.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              ease: updatedCard.ease,
              review_count: updatedCard.review_count,
              correct_count: updatedCard.correct_count,
              incorrect_count: updatedCard.incorrect_count,
              last_reviewed: updatedCard.last_reviewed,
            }
          : card
      );
      setFilteredCards(updatedFilteredCards);

      // Let user manually proceed to next card
    } catch (error) {
      console.error("Error marking card as correct:", error);
      toast.error("Failed to update card");
    }
  };

  const handlePartiallyCorrect = async () => {
    if (!currentCard) return;

    try {
      // Update card stats in the database
      const updatedCard = await markCardPartiallyCorrect(currentCard.id);

      // Update the card in our local state with the new stats
      const updatedCards = cards.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              ease: updatedCard.ease,
              review_count: updatedCard.review_count,
              correct_count: updatedCard.correct_count,
              partial_correct_count: updatedCard.partial_correct_count,
              incorrect_count: updatedCard.incorrect_count,
              last_reviewed: updatedCard.last_reviewed,
            }
          : card
      );
      setCards(updatedCards);

      // Also update the card in filteredCards to ensure proper sorting
      const updatedFilteredCards = filteredCards.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              ease: updatedCard.ease,
              review_count: updatedCard.review_count,
              correct_count: updatedCard.correct_count,
              partial_correct_count: updatedCard.partial_correct_count,
              incorrect_count: updatedCard.incorrect_count,
              last_reviewed: updatedCard.last_reviewed,
            }
          : card
      );
      setFilteredCards(updatedFilteredCards);

      // Let user manually proceed to next card
    } catch (error) {
      console.error("Error marking card as partially correct:", error);
      toast.error("Failed to update card");
    }
  };

  const handleWrong = async () => {
    if (!currentCard) return;

    try {
      // Update card stats in the database
      const updatedCard = await markCardIncorrect(currentCard.id);

      // Update the card in our local state with the new stats
      const updatedCards = cards.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              ease: updatedCard.ease,
              review_count: updatedCard.review_count,
              correct_count: updatedCard.correct_count,
              incorrect_count: updatedCard.incorrect_count,
              last_reviewed: updatedCard.last_reviewed,
            }
          : card
      );
      setCards(updatedCards);

      // Also update the card in filteredCards to ensure proper sorting
      const updatedFilteredCards = filteredCards.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              ease: updatedCard.ease,
              review_count: updatedCard.review_count,
              correct_count: updatedCard.correct_count,
              incorrect_count: updatedCard.incorrect_count,
              last_reviewed: updatedCard.last_reviewed,
            }
          : card
      );
      setFilteredCards(updatedFilteredCards);

      // Let user manually proceed to next card
    } catch (error) {
      console.error("Error marking card as incorrect:", error);
      toast.error("Failed to update card");
    }
  };

  if (filteredCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
        <div className="w-20 h-20 mb-6 rounded-full bg-muted flex items-center justify-center">
          <BookOpen
            className="w-10 h-10 text-muted-foreground"
            strokeWidth={1.5}
          />
        </div>
        <h2 className="text-2xl font-bold mb-3">Ready to study</h2>
        <p className="text-muted-foreground mb-10">
          Select one or more decks from the sidebar to start reviewing
          flashcards.
        </p>

        <div className="grid grid-cols-1 gap-6 w-full max-w-xs">
          <div className="flex items-start gap-3 text-left">
            <div className="bg-primary/10 p-2 rounded-md">
              <LayoutGrid className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Select decks</h3>
              <p className="text-xs text-muted-foreground">
                Choose flashcard decks from the sidebar categories
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="bg-primary/10 p-2 rounded-md">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Review cards</h3>
              <p className="text-xs text-muted-foreground">
                Test your knowledge with spaced repetition
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="bg-primary/10 p-2 rounded-md">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Track progress</h3>
              <p className="text-xs text-muted-foreground">
                Build long-term memory with our adaptive algorithm
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-1 flex flex-col items-center justify-center">
        {isLoading ? (
          <div>Loading cards...</div>
        ) : (
          currentCard && (
            <Flashcard
              key={cardKey}
              card={currentCard}
              onUpdate={handleUpdateCard}
              onDelete={() => setIsDeleteModalOpen(true)}
              onAnswered={handleAnswered}
              onPrevious={cardHistory.canGoBack() ? handlePrevCard : undefined}
              onNext={handleNextCard}
              onCorrect={handleCorrect}
              onPartiallyCorrect={handlePartiallyCorrect}
              onWrong={handleWrong}
              allCards={filteredCards}
            />
          )
        )}
      </div>

      <AddCardModal
        open={isAddCardModalOpen}
        onOpenChange={setIsAddCardModalOpen}
        onAddCard={handleAddCard}
        onAddMultipleCards={handleAddMultipleCards}
        availableDecks={getAvailableDecks()}
        defaultDeckId={
          selectedDecks.length > 0 ? selectedDecks[0].deckId : undefined
        }
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeleteCard}
      />
    </div>
  );
}
