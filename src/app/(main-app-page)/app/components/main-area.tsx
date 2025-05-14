"use client";

import { useState, useEffect } from "react";
import Flashcard from "./flashcard";
import AddCardModal from "./add-card-modal";
import DeleteConfirmationModal from "./delete-confirmation-modal";
import { toast } from "sonner";
import {
  getAllCardsInDeck,
  markCardCorrect,
  markCardIncorrect,
} from "@/features/cards/card";
import { sortCardsToReview } from "@/features/cards/sorting";

interface UICard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  ease: number;
  review_count: number;
  last_reviewed: Date;
}

interface MainAreaProps {
  selectedDecks?: { deckId: string; cardCount: number }[];
  debugMode?: boolean;
}

export default function MainArea({
  selectedDecks = [],
  debugMode = false,
}: MainAreaProps) {
  const [cards, setCards] = useState<UICard[]>([]);
  const [filteredCards, setFilteredCards] = useState<UICard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load and sort cards when selected decks change
  useEffect(() => {
    const loadCards = async () => {
      if (selectedDecks.length === 0) {
        setCards([]);
        setFilteredCards([]);
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
          last_reviewed: card.last_reviewed,
        }));

        // Sort cards by priority
        const sortedCards = sortCardsToReview(transformedCards);

        setCards(transformedCards);
        setFilteredCards(sortedCards);
        setCurrentCardIndex(0);
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
    }
  };

  const handlePrevCard = () => {
    if (filteredCards.length > 0) {
      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredCards.length) % filteredCards.length
      );
      setCardKey((prev) => prev + 1);
    }
  };

  const handleAnswered = () => {
    // This is called when a card is flipped, but we don't need to do anything
  };

  const handleAddCard = (question: string, answer: string, deckId: string) => {
    const newCard = {
      id: `${Date.now()}`,
      deckId,
      question,
      answer,
      ease: 2.5,
      review_count: 0,
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
    newCards: Array<{ question: string; answer: string }>,
    deckId: string
  ) => {
    const cardsToAdd = newCards.map((card, index) => ({
      id: `${Date.now()}-${index}`,
      deckId,
      question: card.question,
      answer: card.answer,
      ease: 2.5,
      review_count: 0,
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
              last_reviewed: updatedCard.last_reviewed,
            }
          : card
      );
      setFilteredCards(updatedFilteredCards);

      toast.success("Marked as correct");
      handleNextCard();
    } catch (error) {
      console.error("Error marking card as correct:", error);
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
              last_reviewed: updatedCard.last_reviewed,
            }
          : card
      );
      setFilteredCards(updatedFilteredCards);

      toast.error("Marked as wrong");
      handleNextCard();
    } catch (error) {
      console.error("Error marking card as incorrect:", error);
      toast.error("Failed to update card");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-start pt-8">
        {selectedDecks.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>
              No decks selected. Please select at least one deck from the
              sidebar.
            </p>
          </div>
        ) : filteredCards.length > 0 ? (
          <>
            {debugMode && (
              <div className="text-sm text-gray-500 mb-2">
                Card {currentCardIndex + 1} of {filteredCards.length}
              </div>
            )}
            <Flashcard
              key={cardKey}
              card={currentCard}
              onUpdate={handleUpdateCard}
              onDelete={() => setIsDeleteModalOpen(true)}
              onAnswered={handleAnswered}
              onPrevious={handlePrevCard}
              onNext={handleNextCard}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
            />
          </>
        ) : (
          <div className="text-center text-gray-500">
            <p>
              No cards available in the selected decks. Add a new card to get
              started.
            </p>
          </div>
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
