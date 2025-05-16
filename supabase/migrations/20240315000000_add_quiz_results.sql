-- Enable uuid-ossp extension if not already enabled
create extension if not exists "uuid-ossp";

create table
    public.quiz_results (
        id uuid not null default uuid_generate_v4 () primary key,
        deck_id uuid not null references public.decks (id) on delete cascade,
        results jsonb not null,
        average_grade numeric not null,
        total_questions integer not null,
        created_at timestamp
        with
            time zone not null default now (),
            updated_at timestamp
        with
            time zone not null default now ()
    );

-- Create index on deck_id for better performance
create index idx_quiz_results_deck_id on public.quiz_results (deck_id);

-- Add RLS policies
alter table public.quiz_results enable row level security;

create policy "Users can view their own quiz results" on public.quiz_results for
select
    using (
        auth.uid () in (
            select
                profile_id
            from
                public.decks
            where
                id = deck_id
        )
    );

create policy "Users can insert their own quiz results" on public.quiz_results for insert
with
    check (
        auth.uid () in (
            select
                profile_id
            from
                public.decks
            where
                id = deck_id
        )
    );