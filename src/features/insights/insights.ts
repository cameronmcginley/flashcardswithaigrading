import { supabase } from "@/lib/supabase";

/** Create a new review log entry */
export const insertReviewLog = async (log: {
  user_id: string;
  card_id: string;
  deck_id: string;
  category_id: string;
  grade: number;
  answer_time_ms: number;
  previous_ease_factor: number;
  new_ease_factor: number;
  correct: boolean;
  grading_difficulty: "beginner" | "adept" | "master";
}) => {
  const { data, error } = await supabase
    .from("review_logs")
    .insert([log])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/** Get daily stats for the past N days */
export const getDailyStats = async (days = 14) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("review_logs")
    .select("grade, correct, answer_time_ms, reviewed_at")
    .gte("reviewed_at", since.toISOString());

  if (error) throw error;

  const grouped: Record<
    string,
    { total: number; correct: number; gradeSum: number; timeSum: number }
  > = {};

  for (const row of data) {
    const day = new Date(row.reviewed_at).toISOString().split("T")[0];
    if (!grouped[day])
      grouped[day] = { total: 0, correct: 0, gradeSum: 0, timeSum: 0 };

    grouped[day].total += 1;
    grouped[day].correct += row.correct ? 1 : 0;
    grouped[day].gradeSum += row.grade;
    grouped[day].timeSum += row.answer_time_ms;
  }

  return Object.entries(grouped)
    .map(([day, stats]) => ({
      day,
      totalReviews: stats.total,
      correctPercent: Math.round((stats.correct / stats.total) * 100),
      avgGrade: Math.round(stats.gradeSum / stats.total),
      avgAnswerTimeSec: Math.round(stats.timeSum / stats.total / 10) / 100,
    }))
    .sort((a, b) => (a.day > b.day ? -1 : 1));
};

/** Get aggregate stats for a custom time range */
export const getStatsInRange = async (start: Date, end: Date = new Date()) => {
  const { data, error } = await supabase
    .from("review_logs")
    .select("correct, new_ease_factor")
    .gte("reviewed_at", start.toISOString())
    .lte("reviewed_at", end.toISOString());

  if (error) throw error;

  const totalReviews = data.length;
  const totalCorrect = data.filter((d) => d.correct).length;
  const totalIncorrect = totalReviews - totalCorrect;
  const averageEase =
    totalReviews === 0
      ? 0
      : Math.round(
          (data.reduce((sum, r) => sum + r.new_ease_factor, 0) / totalReviews) *
            10
        ) / 10;

  return {
    totalReviews,
    totalCorrect,
    totalIncorrect,
    averageEase,
  };
};

/* -------------------------------------------------------------------------- */
/*                                AGGREGATES                                 */
/* -------------------------------------------------------------------------- */

/** Get all-time performance summary */
export const getAllTimeStats = async () => {
  const { data, error } = await supabase
    .from("review_logs")
    .select("correct, reviewed_at, new_ease_factor");

  if (error) throw error;

  const totalReviews = data.length;
  const totalCorrect = data.filter((d) => d.correct).length;
  const totalIncorrect = totalReviews - totalCorrect;
  const averageEase =
    totalReviews === 0
      ? 0
      : Math.round(
          (data.reduce((sum, r) => sum + r.new_ease_factor, 0) / totalReviews) *
            10
        ) / 10;

  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  const reviewsToday = data.filter(
    (d) => new Date(d.reviewed_at) >= startOfToday
  ).length;

  const reviewsThisWeek = data.filter(
    (d) => new Date(d.reviewed_at) >= startOfWeek
  ).length;

  const streakDays = computeStreakDays(data.map((r) => r.reviewed_at));
  const mostActiveDay = findMostCommonDay(data.map((r) => r.reviewed_at));
  const mostActiveHour = findMostCommonHour(data.map((r) => r.reviewed_at));

  return {
    totalReviews,
    totalCorrect,
    totalIncorrect,
    averageEase,
    reviewsToday,
    reviewsThisWeek,
    streakDays,
    mostActiveDay,
    mostActiveHour,
  };
};

/** Deck-level performance overview */
export const getDeckPerformanceStats = async () => {
  const { data, error } = await supabase
    .from("review_logs")
    .select("deck_id, grade, correct, decks!inner(name)");

  if (error) throw error;

  const grouped: Record<
    string,
    { name: string; total: number; correct: number; gradeSum: number }
  > = {};

  for (const row of data) {
    const deckId = row.deck_id;
    const deckName = row.decks.name;

    if (!grouped[deckId])
      grouped[deckId] = { name: deckName, total: 0, correct: 0, gradeSum: 0 };

    grouped[deckId].total += 1;
    grouped[deckId].correct += row.correct ? 1 : 0;
    grouped[deckId].gradeSum += row.grade;
  }

  return Object.entries(grouped)
    .map(([id, s]) => ({
      deckId: id,
      deckName: s.name,
      totalReviews: s.total,
      correctPercent: Math.round((s.correct / s.total) * 100),
      avgGrade: Math.round(s.gradeSum / s.total),
    }))
    .sort((a, b) => b.avgGrade - a.avgGrade);
};

/** Avg score when user marks cards correct */
export const getUserAvgCorrectScore = async (userId: string) => {
  const { data, error } = await supabase
    .from("review_logs")
    .select("grade")
    .eq("user_id", userId)
    .eq("correct", true);

  if (error) throw error;
  if (!data.length) return null;

  const avg = data.reduce((sum, row) => sum + row.grade, 0) / data.length;
  return Math.round(avg);
};

/** Avg ease delta across all reviews */
export const getAverageEaseDelta = async () => {
  const { data, error } = await supabase
    .from("review_logs")
    .select("previous_ease_factor, new_ease_factor");

  if (error) throw error;
  if (!data.length) return null;

  const deltaSum = data.reduce(
    (sum, r) => sum + (r.new_ease_factor - r.previous_ease_factor),
    0
  );

  return Math.round((deltaSum / data.length) * 100) / 100;
};

function computeStreakDays(timestamps: string[]) {
  const dates = new Set(
    timestamps.map((ts) => new Date(ts).toISOString().split("T")[0])
  );
  const today = new Date();
  let streak = 0;

  while (dates.has(today.toISOString().split("T")[0])) {
    streak++;
    today.setDate(today.getDate() - 1);
  }

  return streak;
}

function findMostCommonDay(timestamps: string[]) {
  const counts = Array(7).fill(0);
  timestamps.forEach((ts) => counts[new Date(ts).getDay()]++);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[counts.indexOf(Math.max(...counts))];
}

function findMostCommonHour(timestamps: string[]) {
  const counts = Array(24).fill(0);
  timestamps.forEach((ts) => counts[new Date(ts).getHours()]++);
  const hour = counts.indexOf(Math.max(...counts));
  return new Date(0, 0, 0, hour).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export interface CategoryStatsResponse {
  id: string;
  name: string;
  deck_count: number;
  card_count: number;
  total_reviews: number;
  correct_reviews: number;
  incorrect_reviews: number;
  accuracy: number;
  average_ease: number;
}

export const getCategoryStats = async (
  timeRange: string
): Promise<CategoryStatsResponse[]> => {
  const { data, error } = await supabase.rpc("get_category_stats", {
    time_range: timeRange,
  });

  if (error) throw error;
  return data;
};
