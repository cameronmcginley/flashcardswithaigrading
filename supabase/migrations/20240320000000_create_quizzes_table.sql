create table public.quizzes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  deck_ids uuid[] not null,
  num_questions integer not null,
  status text not null default 'pending',
  questions jsonb,
  answers jsonb,
  feedback jsonb,
  score numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table public.quizzes enable row level security;

create policy "Users can create their own quizzes"
  on public.quizzes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own quizzes"
  on public.quizzes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own quizzes"
  on public.quizzes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own quizzes"
  on public.quizzes for delete
  to authenticated
  using (auth.uid() = user_id); 