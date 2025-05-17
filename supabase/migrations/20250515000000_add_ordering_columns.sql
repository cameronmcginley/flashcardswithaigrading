-- Add ordering columns to categories and decks tables
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER;
ALTER TABLE decks ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Update existing records to have default order based on name
UPDATE categories SET display_order = id::text::bigint % 1000000 WHERE display_order IS NULL;
UPDATE decks SET display_order = id::text::bigint % 1000000 WHERE display_order IS NULL;

-- Modify the existing query to use display_order for sorting
CREATE OR REPLACE FUNCTION update_category_order(category_id UUID, new_order INTEGER) 
RETURNS void AS $$
BEGIN
  UPDATE categories
  SET display_order = new_order
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_deck_order(deck_id UUID, new_order INTEGER) 
RETURNS void AS $$
BEGIN
  UPDATE decks
  SET display_order = new_order
  WHERE id = deck_id;
END;
$$ LANGUAGE plpgsql;

-- Update getAllCategoriesWithDecks to order by display_order
-- This will be handled in the application code 