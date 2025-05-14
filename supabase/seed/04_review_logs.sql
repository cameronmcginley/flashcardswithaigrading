-- Seed data for review logs
-- This will generate realistic review data for the past year

-- Function to generate random timestamp within the last year
CREATE OR REPLACE FUNCTION random_timestamp_last_year()
RETURNS TIMESTAMP AS $$
BEGIN
    RETURN NOW() - (random() * interval '365 days');
END;
$$ LANGUAGE plpgsql;

-- Insert seed data for review logs
WITH RECURSIVE dates AS (
    SELECT generate_series(
        NOW() - interval '365 days',
        NOW(),
        interval '1 hour'
    ) AS review_date
),
review_data AS (
    SELECT 
        review_date,
        -- Simulate more reviews during common study hours (8AM-10PM)
        CASE 
            WHEN EXTRACT(HOUR FROM review_date) BETWEEN 8 AND 22 
            THEN floor(random() * 5)::int + 1
            ELSE floor(random() * 2)::int
        END as num_reviews
    FROM dates
    WHERE random() < 0.3  -- Only generate reviews for ~30% of hours to create realistic patterns
),
card_reviews AS (
    SELECT
        review_date,
        c.id as card_id,
        c.deck_id,
        d.category_id,
        -- Generate grades with a realistic distribution
        CASE 
            WHEN random() < 0.7 THEN floor(random() * 20 + 80)::int  -- 70% good grades (80-100)
            WHEN random() < 0.9 THEN floor(random() * 30 + 50)::int  -- 20% medium grades (50-80)
            ELSE floor(random() * 50)::int                           -- 10% poor grades (0-50)
        END::int as calculated_grade
    FROM review_data
    CROSS JOIN generate_series(1, num_reviews)
    CROSS JOIN LATERAL (
        SELECT c.id, c.deck_id
        FROM cards c
        ORDER BY random() 
        LIMIT 1
    ) c
    INNER JOIN decks d ON d.id = c.deck_id
)
INSERT INTO review_logs (
    profile_id,
    card_id,
    deck_id,
    category_id,
    grade,
    answer_time_ms,
    previous_ease_factor,
    new_ease_factor,
    correct,
    grading_difficulty,
    reviewed_at
)
SELECT
    '00000000-0000-0000-0000-000000000000'::uuid as profile_id,
    card_id,
    deck_id,
    category_id,
    calculated_grade as grade,
    -- Answer times between 2 seconds and 2 minutes
    (random() * 118000 + 2000)::int as answer_time_ms,
    -- Previous ease factor between 1.3 and 2.5
    (random() * 1.2 + 1.3)::float as previous_ease_factor,
    -- New ease factor slightly adjusted from previous
    (random() * 1.2 + 1.3)::float as new_ease_factor,
    -- Correct answers correlate with grades
    CASE 
        WHEN calculated_grade >= 80 THEN true
        WHEN calculated_grade >= 50 THEN random() < 0.5
        ELSE false
    END::boolean as correct,
    -- Distribute difficulty levels
    CASE floor(random() * 3)::int
        WHEN 0 THEN 'beginner'
        WHEN 1 THEN 'adept'
        ELSE 'master'
    END::grading_difficulty_type as grading_difficulty,
    review_date as reviewed_at
FROM card_reviews;

-- Drop the temporary function
DROP FUNCTION random_timestamp_last_year(); 