-- Add partial_correct_count column to cards table
ALTER TABLE cards 
ADD COLUMN partial_correct_count int DEFAULT 0;

-- Update review_logs type to include partial correct
ALTER TYPE grading_difficulty_type RENAME TO grading_difficulty_type_old;
CREATE TYPE grading_verdict_type AS ENUM ('correct', 'partial', 'incorrect');
ALTER TABLE review_logs 
ADD COLUMN verdict grading_verdict_type;

-- Update verdict based on existing grade values
UPDATE review_logs 
SET verdict = CASE 
    WHEN grade >= 80 THEN 'correct'::grading_verdict_type
    WHEN grade >= 60 THEN 'partial'::grading_verdict_type
    ELSE 'incorrect'::grading_verdict_type
END;

-- Make verdict not null after populating
ALTER TABLE review_logs 
ALTER COLUMN verdict SET NOT NULL;

-- Update the get_category_stats function to include partial_correct
CREATE OR REPLACE FUNCTION get_category_stats(time_range text)
RETURNS TABLE (
  id uuid,
  name text,
  deck_count bigint,
  card_count bigint,
  total_reviews bigint,
  correct_reviews bigint,
  partial_reviews bigint,
  incorrect_reviews bigint,
  accuracy numeric,
  average_ease numeric
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
    c.id,
    c.name,
    COUNT(DISTINCT d.id) AS deck_count,
    COUNT(DISTINCT cd.id) AS card_count,
    COUNT(rl.id) AS total_reviews,
    SUM(CASE WHEN rl.verdict = 'correct' THEN 1 ELSE 0 END) AS correct_reviews,
    SUM(CASE WHEN rl.verdict = 'partial' THEN 1 ELSE 0 END) AS partial_reviews,
    SUM(CASE WHEN rl.verdict = 'incorrect' THEN 1 ELSE 0 END) AS incorrect_reviews,
    ROUND(
      (SUM(CASE WHEN rl.verdict IN ('correct', 'partial') THEN 1 ELSE 0 END)::numeric / 
      NULLIF(COUNT(rl.id), 0)::numeric * 100)::numeric,
      1
    ) AS accuracy,
    ROUND(AVG(rl.ease)::numeric, 2) AS average_ease
  FROM
    categories c
    LEFT JOIN decks d ON d.category_id = c.id
    LEFT JOIN cards cd ON cd.deck_id = d.id
    LEFT JOIN review_logs rl ON rl.card_id = cd.id
      AND rl.created_at >= start_date
  WHERE
    c.deleted_at IS NULL
    AND d.deleted_at IS NULL
    AND cd.deleted_at IS NULL
  GROUP BY
    c.id,
    c.name
  ORDER BY
    c.name;
END;
$$ LANGUAGE plpgsql; 