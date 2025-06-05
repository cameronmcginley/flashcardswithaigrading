import { MAX_CATEGORY_NAME_LENGTH } from "./constants";

export const isValidCategoryName = (name: string): boolean => {
  return name.length > 0 && name.length <= MAX_CATEGORY_NAME_LENGTH;
};
