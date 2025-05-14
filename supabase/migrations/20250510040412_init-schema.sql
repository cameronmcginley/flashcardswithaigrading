-- 1. UUID support
create extension if not exists pgcrypto;

-- 2. PROFILES (↔ auth.users)
create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto‑insert profile on sign‑up
create or replace function public.handle_new_user ()
returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. CATEGORIES  (profile 1‑N)
create table categories (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name       text not null,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 4. DECKS  (category 1‑N)
create table decks (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  name       text not null,
  num_cards  int  default 0,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

create index decks_category_id_idx on decks(category_id);
create index decks_profile_id_idx  on decks(profile_id);

-- 5. CARDS  (deck 1‑N)
create table cards (
  id         uuid primary key default gen_random_uuid(),
  deck_id    uuid not null references decks(id) on delete cascade,
  front      text not null,
  back       text not null,
  ease       float default 2.5,
  review_count    int default 0,
  correct_count   int default 0,
  incorrect_count int default 0,
  last_reviewed   timestamptz,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 6. REVIEW LOGS  (for insights)
create type grading_difficulty_type as enum ('beginner','adept','master');

create table review_logs (
  id          uuid default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  card_id     uuid not null references cards(id)    on delete cascade,
  deck_id     uuid not null references decks(id)    on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  grade int not null,
  answer_time_ms int not null,
  previous_ease_factor float not null,
  new_ease_factor      float not null,
  correct boolean not null,
  grading_difficulty grading_difficulty_type not null default 'adept',
  reviewed_at timestamptz not null default now(),
  primary key (id, profile_id)
);

create index review_logs_profile_id_idx   on review_logs(profile_id);
create index review_logs_card_id_idx      on review_logs(card_id);
create index review_logs_deck_id_idx      on review_logs(deck_id);
create index review_logs_reviewed_at_idx  on review_logs(reviewed_at);
create index review_logs_grading_difficulty_idx on review_logs(grading_difficulty);

-- 7. Row‑Level Security
alter table profiles    enable row level security;
alter table categories  enable row level security;
alter table decks       enable row level security;
alter table cards       enable row level security;
alter table review_logs enable row level security;

-- RLS policies
create policy "read own profile"
  on profiles for select using (auth.uid() = id);
create policy "update own profile"
  on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "rw own categories"
  on categories for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "rw own decks"
  on decks for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "rw cards via decks"
  on cards for all using (
    auth.uid() = (select profile_id from decks where decks.id = cards.deck_id)
  ) with check (
    auth.uid() = (select profile_id from decks where decks.id = cards.deck_id)
  );

create policy "rw own review logs"
  on review_logs for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- 8. Allow client roles to read parent/child tables (needed for PostgREST joins)
grant select on categories, decks to anon, authenticated;
