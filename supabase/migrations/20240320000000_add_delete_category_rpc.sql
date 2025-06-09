-- Create the RPC function to handle cascading soft deletes
create or replace function delete_category_with_contents(category_id uuid, deletion_time timestamptz)
returns void as $$
begin
  -- Soft delete all cards in all decks in this category
  update cards c
  set deleted_at = deletion_time
  where c.deck_id in (
    select d.id from decks d where d.category_id = delete_category_with_contents.category_id and d.deleted_at is null
  )
  and c.deleted_at is null;

  -- Soft delete all decks in this category
  update decks d
  set deleted_at = deletion_time
  where d.category_id = delete_category_with_contents.category_id
  and d.deleted_at is null;

  -- Soft delete the category
  update categories c
  set deleted_at = deletion_time
  where c.id = delete_category_with_contents.category_id
  and c.deleted_at is null;
end;
$$ language plpgsql security definer; 