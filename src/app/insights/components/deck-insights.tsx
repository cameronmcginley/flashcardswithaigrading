"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeckInsightsProps {
  timeRange: string;
}

export default function DeckInsights({ timeRange }: DeckInsightsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("reviews");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data for decks
  const decksData = [
    {
      id: "1-1",
      name: "JavaScript",
      category: "Programming",
      cards: 35,
      reviews: 180,
      correct: 150,
      incorrect: 30,
      accuracy: 83.3,
      avgEase: 2.5,
      lastReviewed: "2023-05-10",
    },
    {
      id: "1-2",
      name: "Python",
      category: "Programming",
      cards: 28,
      reviews: 120,
      correct: 95,
      incorrect: 25,
      accuracy: 79.2,
      avgEase: 2.3,
      lastReviewed: "2023-05-09",
    },
    {
      id: "1-3",
      name: "React",
      category: "Programming",
      cards: 42,
      reviews: 150,
      correct: 135,
      incorrect: 15,
      accuracy: 90.0,
      avgEase: 2.7,
      lastReviewed: "2023-05-10",
    },
    {
      id: "2-1",
      name: "Spanish",
      category: "Languages",
      cards: 50,
      reviews: 200,
      correct: 160,
      incorrect: 40,
      accuracy: 80.0,
      avgEase: 2.2,
      lastReviewed: "2023-05-08",
    },
    {
      id: "2-2",
      name: "French",
      category: "Languages",
      cards: 35,
      reviews: 120,
      correct: 80,
      incorrect: 40,
      accuracy: 66.7,
      avgEase: 1.9,
      lastReviewed: "2023-05-07",
    },
    {
      id: "3-1",
      name: "Physics",
      category: "Science",
      cards: 45,
      reviews: 150,
      correct: 120,
      incorrect: 30,
      accuracy: 80.0,
      avgEase: 2.3,
      lastReviewed: "2023-05-09",
    },
    {
      id: "3-2",
      name: "Chemistry",
      category: "Science",
      cards: 50,
      reviews: 130,
      correct: 90,
      incorrect: 40,
      accuracy: 69.2,
      avgEase: 2.0,
      lastReviewed: "2023-05-08",
    },
    {
      id: "4-1",
      name: "World War II",
      category: "History",
      cards: 30,
      reviews: 80,
      correct: 60,
      incorrect: 20,
      accuracy: 75.0,
      avgEase: 2.2,
      lastReviewed: "2023-05-06",
    },
    {
      id: "5-1",
      name: "Calculus",
      category: "Mathematics",
      cards: 25,
      reviews: 100,
      correct: 70,
      incorrect: 30,
      accuracy: 70.0,
      avgEase: 2.1,
      lastReviewed: "2023-05-07",
    },
    {
      id: "5-2",
      name: "Statistics",
      category: "Mathematics",
      cards: 20,
      reviews: 80,
      correct: 60,
      incorrect: 20,
      accuracy: 75.0,
      avgEase: 2.2,
      lastReviewed: "2023-05-05",
    },
  ];

  // Get unique categories for filter
  const categories = [
    "All",
    ...new Set(decksData.map((deck) => deck.category)),
  ];

  // Filter decks based on search query and category filter
  const filteredDecks = decksData.filter(
    (deck) =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (categoryFilter === "all" || deck.category === categoryFilter)
  );

  // Sort decks based on sort column and direction
  const sortedDecks = [...filteredDecks].sort((a, b) => {
    const aValue = a[sortColumn as keyof typeof a];
    const bValue = b[sortColumn as keyof typeof b];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Prepare data for charts
  const topDecksData = [...decksData]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5)
    .map((deck) => ({
      deck: deck.name,
      correct: deck.correct,
      incorrect: deck.incorrect,
    }));

  // Prepare data for heatmap
  const heatmapData = categories
    .filter((category) => category !== "All")
    .map((category) => {
      const categoryDecks = decksData.filter(
        (deck) => deck.category === category
      );
      const totalReviews = categoryDecks.reduce(
        (sum, deck) => sum + deck.reviews,
        0
      );
      const totalCorrect = categoryDecks.reduce(
        (sum, deck) => sum + deck.correct,
        0
      );
      const totalIncorrect = categoryDecks.reduce(
        (sum, deck) => sum + deck.incorrect,
        0
      );
      const avgAccuracy =
        totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
      const avgEase =
        categoryDecks.reduce((sum, deck) => sum + deck.avgEase, 0) /
        categoryDecks.length;

      return {
        category,
        "Total Reviews": totalReviews,
        "Accuracy (%)": avgAccuracy,
        "Average Ease": avgEase * 30, // Scale for better visualization
      };
    });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Decks by Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Top Decks by Reviews</CardTitle>
            <CardDescription>Correct vs incorrect reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveBar
                data={topDecksData}
                keys={["correct", "incorrect"]}
                indexBy="deck"
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={["#4ade80", "#f87171"]}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: "Deck",
                  legendPosition: "middle",
                  legendOffset: 40,
                  truncateTickAt: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Reviews",
                  legendPosition: "middle",
                  legendOffset: -50,
                  truncateTickAt: 0,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                legends={[
                  {
                    dataFrom: "keys",
                    anchor: "top-right",
                    direction: "column",
                    justify: false,
                    translateX: 120,
                    translateY: 0,
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

        {/* Category Performance Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>
              Reviews, accuracy, and ease by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveHeatMap
                data={heatmapData}
                keys={["Total Reviews", "Accuracy (%)", "Average Ease"]}
                indexBy="category"
                margin={{ top: 20, right: 80, bottom: 30, left: 80 }}
                forceSquare={false}
                axisTop={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: "",
                  legendOffset: 36,
                }}
                axisRight={null}
                axisBottom={null}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Category",
                  legendPosition: "middle",
                  legendOffset: -72,
                  truncateTickAt: 0,
                }}
                cellOpacity={1}
                cellBorderColor={{
                  from: "color",
                  modifiers: [["darker", 0.4]],
                }}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
                defs={[
                  {
                    id: "lines",
                    type: "patternLines",
                    background: "inherit",
                    color: "rgba(0, 0, 0, 0.1)",
                    rotation: -45,
                    lineWidth: 4,
                    spacing: 10,
                  },
                ]}
                fill={[{ id: "lines" }]}
                animate={true}
                motionConfig="gentle"
                hoverTarget="cell"
                cellHoverOthersOpacity={0.25}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Decks Performance</CardTitle>
          <CardDescription>Detailed statistics for all decks</CardDescription>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search decks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .filter((category) => category !== "All")
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("name")}
                    >
                      Deck {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("category")}
                    >
                      Category {getSortIcon("category")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("cards")}
                    >
                      Cards {getSortIcon("cards")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("reviews")}
                    >
                      Reviews {getSortIcon("reviews")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("correct")}
                    >
                      Correct {getSortIcon("correct")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("incorrect")}
                    >
                      Incorrect {getSortIcon("incorrect")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("accuracy")}
                    >
                      Accuracy {getSortIcon("accuracy")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("avgEase")}
                    >
                      Avg. Ease {getSortIcon("avgEase")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("lastReviewed")}
                    >
                      Last Reviewed {getSortIcon("lastReviewed")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDecks.map((deck) => (
                  <TableRow key={deck.id}>
                    <TableCell className="font-medium">{deck.name}</TableCell>
                    <TableCell>{deck.category}</TableCell>
                    <TableCell>{deck.cards}</TableCell>
                    <TableCell>{deck.reviews}</TableCell>
                    <TableCell>{deck.correct}</TableCell>
                    <TableCell>{deck.incorrect}</TableCell>
                    <TableCell>{deck.accuracy.toFixed(1)}%</TableCell>
                    <TableCell>{deck.avgEase.toFixed(1)}</TableCell>
                    <TableCell>{deck.lastReviewed}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Study Now</DropdownMenuItem>
                          <DropdownMenuItem>Export Data</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
