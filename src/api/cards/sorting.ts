/** Use seconds since last review, fallback to a large value for never-reviewed cards */
const secondsSince = (date?: Date) => {
  if (!date) return 999999;
  return (Date.now() - new Date(date).getTime()) / 1000;
};

const jitter = () => (Math.random() - 0.5) * 50; // +-25 points

/** Sort cards by weighted score: lower = higher priority */
export const scoreCard = (
  card: {
    ease: number;
    last_reviewed: Date;
    review_count: number;
  },
  use_jitter: boolean = true
) => {
  const easeWeight = (card.ease ?? 2.5) * 1000;
  const recencyBoost = secondsSince(card.last_reviewed) * 0.05;
  const seenWeight = Math.pow(card.review_count ?? 0, 0.7);

  return easeWeight - recencyBoost + seenWeight + (use_jitter ? jitter() : 0);
};

/** Sort cards by review priority (lower score = higher priority) */
export const sortCardsToReview = <
  T extends {
    ease: number;
    last_reviewed: Date;
    review_count: number;
  }
>(
  cards: T[]
): T[] => {
  return [...cards].sort((a, b) => scoreCard(a) - scoreCard(b));
};
