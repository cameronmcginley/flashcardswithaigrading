interface NormalizedCard {
  front: string;
  back: string;
}

export const validateCards = (
  cards: unknown
): { isValid: boolean; error?: string; normalizedCards?: NormalizedCard[] } => {
  if (!Array.isArray(cards)) {
    return {
      isValid: false,
      error: "JSON must be an array of cards.",
    };
  }

  const normalizedCards: NormalizedCard[] = [];
  let isValid = true;

  for (const card of cards) {
    const frontContent = card?.front?.trim() || card?.question?.trim();
    const backContent = card?.back?.trim() || card?.answer?.trim();

    if (!frontContent || !backContent) {
      isValid = false;
      break;
    }

    normalizedCards.push({
      front: frontContent,
      back: backContent,
    });
  }

  if (!isValid) {
    return {
      isValid: false,
      error:
        "Each card must have non-empty front/question and back/answer fields.",
    };
  }

  return {
    isValid: true,
    normalizedCards,
  };
};
