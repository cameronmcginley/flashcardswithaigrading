-- Create the RPC function to handle cascading soft deletes for a deck
create or replace function delete_deck_with_contents(deck_id uuid, deletion_time timestamptz)
returns void as $$
begin
  -- Soft delete all cards in the deck
  update cards c
  set deleted_at = deletion_time
  where c.deck_id = delete_deck_with_contents.deck_id
  and c.deleted_at is null;

  -- Soft delete the deck
  update decks d
  set deleted_at = deletion_time
  where d.id = delete_deck_with_contents.deck_id
  and d.deleted_at is null;
end;
$$ language plpgsql security definer; 