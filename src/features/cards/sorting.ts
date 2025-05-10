/** Use seconds since last review, fallback to a large value for never-reviewed cards */
const secondsSince = (date?: Date) => {
  if (!date) return 999999;
  return (Date.now() - new Date(date).getTime()) / 1000;
};

const jitter = () => (Math.random() - 0.5) * 50; // +-25 points

/** Sort cards by weighted score: lower = higher priority */
const scoreCard = (card: {
  ease: number;
  last_reviewed: Date;
  review_count: number;
}) => {
  const easeWeight = (card.ease ?? 2.5) * 1000;
  const recencyBoost = secondsSince(card.last_reviewed) * 0.05;
  const seenWeight = Math.pow(card.review_count ?? 0, 0.7);

  return easeWeight - recencyBoost + seenWeight + jitter();
};

export const sortCardsToReview = (
  cards: Array<{
    id: string;
    ease: number;
    last_reviewed: Date;
    review_count: number;
  }>
): typeof cards => {
  return [...cards].sort((a, b) => scoreCard(a) - scoreCard(b));
};
