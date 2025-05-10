"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  PieChart,
  TrendingUp,
  Brain,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import CategoryInsights from "./category-insights";
import DeckInsights from "./deck-insights";
import CardInsights from "./card-insights";
import OverviewInsights from "./overview-insights";

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState("all");
  const [currentTab, setCurrentTab] = useState("overview");

  // Mock data for summary stats
  const summaryStats = {
    totalReviews: 1248,
    totalCorrect: 892,
    totalIncorrect: 356,
    averageEase: 2.3,
    reviewsToday: 42,
    reviewsThisWeek: 187,
    streakDays: 14,
    mostActiveDay: "Monday",
    mostActiveTime: "8:00 PM",
  };

  // Calculate accuracy percentage
  const accuracyPercentage = Math.round(
    (summaryStats.totalCorrect / summaryStats.totalReviews) * 100
  );

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Performance Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze your learning progress and identify areas for improvement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.totalReviews}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.reviewsToday} today · {summaryStats.reviewsThisWeek}{" "}
              this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accuracyPercentage}%</div>
            <div className="mt-2">
              <Progress value={accuracyPercentage} className="h-2" />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {summaryStats.totalCorrect}
              </div>
              <div className="flex items-center">
                <XCircle className="h-3 w-3 mr-1 text-red-500" />
                {summaryStats.totalIncorrect}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Ease</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.averageEase.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Higher values indicate easier cards for you
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.streakDays} days
            </div>
            <p className="text-xs text-muted-foreground">
              Most active: {summaryStats.mostActiveDay} at{" "}
              {summaryStats.mostActiveTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="decks">Decks</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewInsights timeRange={timeRange} />
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <CategoryInsights timeRange={timeRange} />
        </TabsContent>
        <TabsContent value="decks" className="space-y-4">
          <DeckInsights timeRange={timeRange} />
        </TabsContent>
        <TabsContent value="cards" className="space-y-4">
          <CardInsights timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
