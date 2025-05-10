-- UUID extension
create extension if not exists "pgcrypto";

-- USERS (managed via Supabase Auth)
-- ========== CATEGORIES ==========
create table
    categories (
        id uuid primary key default gen_random_uuid (),
        user_id uuid references auth.users on delete cascade,
        name text not null,
        created_at timestamptz default now (),
        deleted_at timestamptz default null,
    );

-- ========== DECKS ==========
create table
    decks (
        id uuid primary key default gen_random_uuid (),
        user_id uuid references auth.users on delete cascade,
        category_id uuid references categories (id) on delete set null,
        name text not null,
        num_cards int default 0,
        created_at timestamptz default now (),
        deleted_at timestamptz default null,
    );

-- ========== CARDS ==========
create table
    cards (
        id uuid primary key default gen_random_uuid (),
        deck_id uuid references decks (id) on delete cascade,
        -- Content
        front text not null,
        back text not null,
        -- Anki-like stats
        ease float default 2.5,
        review_count int default 0,
        correct_count int default 0,
        incorrect_count int default 0,
        last_reviewed timestamptz,
        created_at timestamptz default now (),
        deleted_at timestamptz default null,
    );

-- ========== INSIGHTS ==========
create table
    review_logs (
        id uuid primary key default gen_random_uuid (),
        user_id uuid references auth.users on delete cascade,
        card_id uuid references cards (id) on delete cascade,
        deck_id uuid references decks (id) on delete cascade,
        category_id uuid references categories (id) on delete cascade,
        -- Review details
        grade int not null, -- 0-100 scale from AI
        answer_time_ms int not null, -- Time taken to answer in milliseconds
        -- Algorithm fields
        previous_ease_factor float not null, -- Previous ease factor
        new_ease_factor float not null, -- New ease factor after this review
        -- Additional useful fields
        correct boolean not null, -- Whether the user marked the card as correct
        -- Timestamps
        reviewed_at timestamptz not null default now (),
        -- Indexes for faster queries
        constraint fk_user foreign key (user_id) references auth.users (id),
        constraint fk_card foreign key (card_id) references cards (id),
        constraint fk_deck foreign key (deck_id) references decks (id)
    );

-- Index for performance
create index review_logs_user_id_idx on review_logs (user_id);

create index review_logs_card_id_idx on review_logs (card_id);

create index review_logs_deck_id_idx on review_logs (deck_id);

create index review_logs_reviewed_at_idx on review_logs (reviewed_at);

-- ========== RLS ==========
-- Enable row-level security
alter table categories enable row level security;

alter table decks enable row level security;

alter table cards enable row level security;

-- Policies
create policy "Users can read/write their own categories" on categories for all using (auth.uid () = user_id)
with
    check (auth.uid () = user_id);

create policy "Users can read/write their own decks" on decks for all using (auth.uid () = user_id)
with
    check (auth.uid () = user_id);

create policy "Users can access cards only through their own decks" on cards for all using (
    auth.uid () = (
        select
            user_id
        from
            decks
        where
            decks.id = cards.deck_id
    )
)
with
    check (
        auth.uid () = (
            select
                user_id
            from
                decks
            where
                decks.id = cards.deck_id
        )
    );