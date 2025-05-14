-- Create function to get category statistics
create or replace function get_category_stats(time_range text)
returns table (
  id uuid,
  name text,
  deck_count bigint,
  card_count bigint,
  total_reviews bigint,
  correct_reviews bigint,
  incorrect_reviews bigint,
  accuracy numeric,
  average_ease numeric
) as $$
declare
  start_date timestamp;
begin
  -- Calculate start date based on time range
  start_date := case time_range
    when 'day' then now() - interval '1 day'
    when 'week' then now() - interval '7 days'
    when 'month' then now() - interval '30 days'
    when 'year' then now() - interval '365 days'
    else now() - interval '30 days' -- default to month
  end;

  return query
  select
    c.id,
    c.name,
    count(distinct d.id) as deck_count,
    count(distinct cd.id) as card_count,
    count(rl.id) as total_reviews,
    sum(case when rl.grade >= 60 then 1 else 0 end) as correct_reviews,
    sum(case when rl.grade < 60 then 1 else 0 end) as incorrect_reviews,
    round(
      (sum(case when rl.grade >= 60 then 1 else 0 end)::numeric / 
      nullif(count(rl.id), 0)::numeric * 100)::numeric,
      1
    ) as accuracy,
    round(avg(rl.ease)::numeric, 2) as average_ease
  from
    categories c
    left join decks d on d.category_id = c.id
    left join cards cd on cd.deck_id = d.id
    left join review_logs rl on rl.card_id = cd.id
      and rl.created_at >= start_date
  where
    c.deleted_at is null
    and d.deleted_at is null
    and cd.deleted_at is null
  group by
    c.id,
    c.name
  order by
    c.name;
end;
$$ language plpgsql; 