import { MAX_DECK_NAME_LENGTH } from "./constants";

export const isValidDeckName = (name: string): boolean => {
  return name.length > 0 && name.length <= MAX_DECK_NAME_LENGTH;
};
