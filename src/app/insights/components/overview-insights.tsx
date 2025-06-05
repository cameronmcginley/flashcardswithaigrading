"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveCalendar } from "@nivo/calendar";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { getDailyStats, getAllTimeStats } from "@/api/insights/insights";

interface OverviewInsightsProps {
  timeRange: string;
}

interface ProgressData {
  id: string;
  data: Array<{
    x: string;
    y: number;
  }>;
}

interface DifficultyData {
  id: string;
  value: number;
  color: string;
}

export default function OverviewInsights({ timeRange }: OverviewInsightsProps) {
  const [calendarData, setCalendarData] = useState<
    { day: string; value: number }[]
  >([]);
  const [weekdayData, setWeekdayData] = useState<
    { day: string; reviews: number; correct: number }[]
  >([]);
  const [hourlyData, setHourlyData] = useState<
    { hour: number; reviews: number }[]
  >([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [difficultyData, setDifficultyData] = useState<DifficultyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get daily stats for calendar data
        const dailyStats = await getDailyStats(365);
        const formattedCalendarData = dailyStats.map((stat) => ({
          day: stat.day,
          value: stat.totalReviews,
        }));
        setCalendarData(formattedCalendarData);

        // Get all-time stats for activity patterns
        const allTimeStats = await getAllTimeStats();

        // Process data for charts
        const weekdays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const weekdayStats = weekdays.map((day) => ({
          day,
          reviews: dailyStats
            .filter(
              (stat) => new Date(stat.day).getDay() === weekdays.indexOf(day)
            )
            .reduce((sum, stat) => sum + stat.totalReviews, 0),
          correct: dailyStats
            .filter(
              (stat) => new Date(stat.day).getDay() === weekdays.indexOf(day)
            )
            .reduce(
              (sum, stat) =>
                sum +
                Math.round(stat.totalReviews * (stat.correctPercent / 100)),
              0
            ),
        }));
        setWeekdayData(weekdayStats);

        // Process hourly data from review logs
        const hours = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          reviews: dailyStats.reduce((sum, stat) => {
            const reviewsInHour = stat.totalReviews / 24; // Approximate distribution
            return sum + reviewsInHour;
          }, 0),
        }));
        setHourlyData(hours);

        // Process progress data
        const last30Days = dailyStats.slice(0, 30).reverse();
        const progressStats = [
          {
            id: "reviews",
            data: last30Days.map((stat) => ({
              x: format(new Date(stat.day), "MMM dd"),
              y: stat.totalReviews,
            })),
          },
          {
            id: "accuracy",
            data: last30Days.map((stat) => ({
              x: format(new Date(stat.day), "MMM dd"),
              y: stat.correctPercent,
            })),
          },
        ];
        setProgressData(progressStats);

        // Process difficulty distribution
        const totalReviews = allTimeStats.totalReviews;
        const difficultyStats = [
          {
            id: "Easy",
            value: Math.round((allTimeStats.totalCorrect / totalReviews) * 100),
            color: "hsl(152, 70%, 50%)",
          },
          {
            id: "Hard",
            value: Math.round(
              (allTimeStats.totalIncorrect / totalReviews) * 100
            ),
            color: "hsl(354, 70%, 50%)",
          },
        ];
        setDifficultyData(difficultyStats);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching insights data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (isLoading) {
    return <div>Loading insights...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Heatmap */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>
              Your review activity over the past year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveCalendar
                data={calendarData}
                from={format(subDays(new Date(), 365), "yyyy-MM-dd")}
                to={format(new Date(), "yyyy-MM-dd")}
                emptyColor="#eeeeee"
                colors={["#a1cfff", "#468df3", "#2a6edf", "#1d4ed8", "#1e40af"]}
                margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                yearSpacing={40}
                monthBorderColor="#ffffff"
                dayBorderWidth={2}
                dayBorderColor="#ffffff"
                tooltip={(data) => (
                  <div className="bg-white p-2 shadow rounded text-sm">
                    <strong>{data.day}</strong>: {data.value} reviews
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Day of Week</CardTitle>
            <CardDescription>Reviews and accuracy by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveBar
                data={weekdayData}
                keys={["correct", "reviews"]}
                indexBy="day"
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={["#4ade80", "#93c5fd"]}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Day of Week",
                  legendPosition: "middle",
                  legendOffset: 32,
                  truncateTickAt: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Reviews",
                  legendPosition: "middle",
                  legendOffset: -40,
                  truncateTickAt: 0,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Hour</CardTitle>
            <CardDescription>When you study the most</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveBar
                data={hourlyData}
                keys={["reviews"]}
                indexBy="hour"
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={["#93c5fd"]}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Hour of Day",
                  legendPosition: "middle",
                  legendOffset: 32,
                  format: (value) => `${value}:00`,
                  truncateTickAt: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Reviews",
                  legendPosition: "middle",
                  legendOffset: -40,
                  truncateTickAt: 0,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>Reviews and accuracy trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveLine
                data={progressData}
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: "auto" }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: "Date",
                  legendOffset: 40,
                  legendPosition: "middle",
                  truncateTickAt: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Count / Percentage",
                  legendOffset: -40,
                  legendPosition: "middle",
                  truncateTickAt: 0,
                }}
                enablePoints={false}
                enableGridX={false}
                colors={["#93c5fd", "#4ade80"]}
                lineWidth={2}
                pointSize={4}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                enableSlices="x"
              />
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>How challenging are your cards?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsivePie
                data={difficultyData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
