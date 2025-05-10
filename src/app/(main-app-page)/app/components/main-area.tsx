"use client";

import { useState, useEffect } from "react";
import Flashcard from "./flashcard";
import AddCardModal from "./add-card-modal";
import DeleteConfirmationModal from "./delete-confirmation-modal";
import { Button } from "@/components/ui/button";

// Mock flashcard data with deck associations
const initialCards = [
  {
    id: "1",
    deckId: "1-1", // JavaScript
    question: "What is a closure in JavaScript?",
    answer:
      "A closure is a function that has access to its own scope, the scope of the outer function, and the global scope.",
  },
  {
    id: "2",
    deckId: "1-1", // JavaScript
    question: "What is the difference between let and var?",
    answer:
      "let is block-scoped while var is function-scoped. let was introduced in ES6.",
  },
  {
    id: "3",
    deckId: "1-2", // Python
    question: "What are Python decorators?",
    answer:
      "Decorators are functions that modify the functionality of another function.",
  },
  {
    id: "4",
    deckId: "1-3", // React
    question: "What is JSX?",
    answer:
      "JSX is a syntax extension for JavaScript that looks similar to HTML and is used with React to describe the UI.",
  },
  {
    id: "5",
    deckId: "2-1", // Spanish
    question: "¿Cómo estás?",
    answer: "How are you?",
  },
  {
    id: "6",
    deckId: "3-1", // Physics
    question: "What is Newton's First Law?",
    answer:
      "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
  },
];

// Update the MainArea component to respect debug mode
interface MainAreaProps {
  selectedDecks?: { deckId: string; cardCount: number }[];
  debugMode?: boolean;
}

export default function MainArea({
  selectedDecks = [],
  debugMode = false,
}: MainAreaProps) {
  const [cards, setCards] = useState(initialCards);
  const [filteredCards, setFilteredCards] = useState<typeof initialCards>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Filter cards based on selected decks
  useEffect(() => {
    if (selectedDecks.length === 0) {
      setFilteredCards([]);
      return;
    }

    const selectedDeckIds = selectedDecks.map((deck) => deck.deckId);
    const filtered = cards.filter((card) =>
      selectedDeckIds.includes(card.deckId)
    );
    setFilteredCards(filtered);
    setCurrentCardIndex(0); // Reset to first card when selection changes
    setHasAnswered(false); // Reset answered state
  }, [selectedDecks, cards]);

  const currentCard = filteredCards[currentCardIndex];

  const handleNextCard = () => {
    if (filteredCards.length > 0) {
      setCurrentCardIndex(
        (prevIndex) => (prevIndex + 1) % filteredCards.length
      );
      setCardKey((prev) => prev + 1); // Force reset grading on card change
      setHasAnswered(false); // Reset answered state
    }
  };

  const handlePrevCard = () => {
    if (filteredCards.length > 0) {
      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredCards.length) % filteredCards.length
      );
      setCardKey((prev) => prev + 1); // Force reset grading on card change
      setHasAnswered(false); // Reset answered state
    }
  };

  const handleAnswered = () => {
    setHasAnswered(true);
  };

  const handleAddCard = (question: string, answer: string, deckId: string) => {
    const newCard = {
      id: `${Date.now()}`, // Use timestamp for unique ID
      deckId,
      question,
      answer,
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);

    // Update filtered cards if the new card's deck is selected
    if (selectedDecks.some((deck) => deck.deckId === deckId)) {
      setFilteredCards([...filteredCards, newCard]);
      setCurrentCardIndex(filteredCards.length); // Move to the new card
    }

    setIsAddCardModalOpen(false);
  };

  const handleAddMultipleCards = (
    newCards: Array<{ question: string; answer: string }>,
    deckId: string
  ) => {
    const cardsToAdd = newCards.map((card, index) => ({
      id: `${Date.now()}-${index}`, // Use timestamp with index for unique IDs
      deckId,
      question: card.question,
      answer: card.answer,
    }));

    const updatedCards = [...cards, ...cardsToAdd];
    setCards(updatedCards);

    // Update filtered cards if the new cards' deck is selected
    if (selectedDecks.some((deck) => deck.deckId === deckId)) {
      setFilteredCards([...filteredCards, ...cardsToAdd]);
      setCurrentCardIndex(filteredCards.length); // Move to the first new card
    }

    setIsAddCardModalOpen(false);
  };

  const handleDeleteCard = () => {
    if (filteredCards.length <= 1) {
      return; // Don't delete the last card
    }

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

  // Get all available decks for the dropdown in AddCardModal
  const getAvailableDecks = () => {
    // In a real app, you would get this from your global state or API
    return [
      { id: "1-1", name: "JavaScript", categoryName: "Programming" },
      { id: "1-2", name: "Python", categoryName: "Programming" },
      { id: "1-3", name: "React", categoryName: "Programming" },
      { id: "2-1", name: "Spanish", categoryName: "Languages" },
      { id: "2-2", name: "French", categoryName: "Languages" },
      { id: "3-1", name: "Physics", categoryName: "Science" },
      { id: "3-2", name: "Chemistry", categoryName: "Science" },
    ];
  };

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
            {/* Only show card count when debug mode is enabled */}
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
            />
            <div className="flex gap-4 mt-6">
              {/* Show navigation buttons based on debug mode or answered state */}
              {debugMode ? (
                // In debug mode, show both buttons
                <>
                  <Button variant="outline" onClick={handlePrevCard}>
                    Previous
                  </Button>
                  <Button variant="outline" onClick={handleNextCard}>
                    Next
                  </Button>
                </>
              ) : (
                // In normal mode, only show Next button when answered
                hasAnswered && (
                  <Button variant="outline" onClick={handleNextCard}>
                    Next
                  </Button>
                )
              )}
            </div>
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
