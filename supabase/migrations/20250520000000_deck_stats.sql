-- Create function to get deck statistics
CREATE OR REPLACE FUNCTION get_deck_stats(time_range text)
RETURNS TABLE (
  id uuid,
  name text,
  category_name text,
  card_count bigint,
  total_reviews bigint,
  correct_reviews bigint,
  incorrect_reviews bigint,
  accuracy numeric,
  average_ease numeric,
  last_reviewed timestamp with time zone
) AS $$
DECLARE
  start_date timestamp;
BEGIN
  -- Calculate start date based on time range
  start_date := CASE time_range
    WHEN 'day' THEN now() - interval '1 day'
    WHEN 'week' THEN now() - interval '7 days'
    WHEN 'month' THEN now() - interval '30 days'
    WHEN 'year' THEN now() - interval '365 days'
    ELSE now() - interval '30 days' -- default to month
  END;

  RETURN QUERY
  SELECT
    d.id,
    d.name,
    c.name AS category_name,
    COUNT(DISTINCT cd.id) AS card_count,
    COUNT(rl.id) AS total_reviews,
    SUM(CASE WHEN rl.verdict = 'correct'::grading_verdict_type THEN 1 ELSE 0 END) AS correct_reviews,
    SUM(CASE WHEN rl.verdict = 'incorrect'::grading_verdict_type THEN 1 ELSE 0 END) AS incorrect_reviews,
    ROUND(
      (SUM(CASE WHEN rl.verdict IN ('correct'::grading_verdict_type, 'partial'::grading_verdict_type) THEN 1 ELSE 0 END)::numeric / 
      NULLIF(COUNT(rl.id), 0)::numeric * 100)::numeric,
      1
    ) AS accuracy,
    ROUND(AVG(rl.ease)::numeric, 2) AS average_ease,
    MAX(rl.reviewed_at) AS last_reviewed
  FROM
    decks d
    LEFT JOIN categories c ON c.id = d.category_id
    LEFT JOIN cards cd ON cd.deck_id = d.id
    LEFT JOIN review_logs rl ON rl.card_id = cd.id
      AND rl.reviewed_at >= start_date
  WHERE
    d.deleted_at IS NULL
    AND cd.deleted_at IS NULL
    AND c.deleted_at IS NULL
  GROUP BY
    d.id,
    d.name,
    c.name
  ORDER BY
    c.name, d.name;
END;
$$ LANGUAGE plpgsql; 