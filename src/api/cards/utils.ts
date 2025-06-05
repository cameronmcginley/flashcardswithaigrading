import { MAX_CARD_BACK_LENGTH, MAX_CARD_FRONT_LENGTH } from "./constants";

export const isValidCardFrontAndBack = (
  front?: string,
  back?: string
): boolean => {
  if (front && front.length > MAX_CARD_FRONT_LENGTH) return false;
  if (back && back.length > MAX_CARD_BACK_LENGTH) return false;
  if ((front && front.length < 1) || (back && back.length < 1)) return false;
  return true;
};
