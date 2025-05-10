"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveCalendar } from "@nivo/calendar";
import { ResponsivePie } from "@nivo/pie";
import { subDays, format } from "date-fns";

interface OverviewInsightsProps {
  timeRange: string;
}

export default function OverviewInsights({ timeRange }: OverviewInsightsProps) {
  // Generate dates for the last 365 days
  const today = new Date();
  const calendarData = Array.from({ length: 365 }, (_, i) => {
    const date = subDays(today, i);
    return {
      day: format(date, "yyyy-MM-dd"),
      value: Math.floor(Math.random() * 10), // Random value between 0-9
    };
  });

  // Mock data for review activity by day of week
  const weekdayData = [
    { day: "Monday", reviews: 156, correct: 112 },
    { day: "Tuesday", reviews: 142, correct: 98 },
    { day: "Wednesday", reviews: 187, correct: 145 },
    { day: "Thursday", reviews: 124, correct: 89 },
    { day: "Friday", reviews: 98, correct: 72 },
    { day: "Saturday", reviews: 65, correct: 48 },
    { day: "Sunday", reviews: 89, correct: 67 },
  ];

  // Mock data for review activity by hour
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    return {
      hour: i,
      reviews: Math.floor(Math.random() * 50),
    };
  });

  // Mock data for progress over time
  const progressData = [
    {
      id: "reviews",
      data: Array.from({ length: 30 }, (_, i) => ({
        x: format(subDays(today, 29 - i), "MMM dd"),
        y: Math.floor(Math.random() * 50) + 10,
      })),
    },
    {
      id: "accuracy",
      data: Array.from({ length: 30 }, (_, i) => ({
        x: format(subDays(today, 29 - i), "MMM dd"),
        y: Math.floor(Math.random() * 30) + 60, // Percentage between 60-90%
      })),
    },
  ];

  // Mock data for card difficulty distribution
  const difficultyData = [
    { id: "Easy", value: 45, color: "hsl(152, 70%, 50%)" },
    { id: "Medium", value: 35, color: "hsl(33, 70%, 50%)" },
    { id: "Hard", value: 20, color: "hsl(354, 70%, 50%)" },
  ];

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
                from={format(subDays(today, 365), "yyyy-MM-dd")}
                to={format(today, "yyyy-MM-dd")}
                emptyColor="#eeeeee"
                colors={["#a1cfff", "#468df3", "#2a6edf", "#1d4ed8", "#1e40af"]}
                margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                yearSpacing={40}
                monthBorderColor="#ffffff"
                dayBorderWidth={2}
                dayBorderColor="#ffffff"
                tooltip={(data) => {
                  return (
                    <div className="bg-white p-2 shadow rounded text-sm">
                      <strong>{data.day}</strong>: {data.value} reviews
                    </div>
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>
              Reviews and accuracy over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveLine
                data={progressData}
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: "auto" }}
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
                colors={{ scheme: "category10" }}
                pointSize={6}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={[
                  {
                    anchor: "top-right",
                    direction: "column",
                    justify: false,
                    translateX: 0,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: "left-to-right",
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: "circle",
                    symbolBorderColor: "rgba(0, 0, 0, .5)",
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Card Difficulty Distribution</CardTitle>
            <CardDescription>
              Based on your performance and ease factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsivePie
                data={difficultyData}
                margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
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
                legends={[
                  {
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 30,
                    itemsSpacing: 0,
                    itemWidth: 80,
                    itemHeight: 20,
                    itemTextColor: "#999",
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: "circle",
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                legends={[
                  {
                    dataFrom: "keys",
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 40,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: "left-to-right",
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
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
      </div>
    </div>
  );
}
