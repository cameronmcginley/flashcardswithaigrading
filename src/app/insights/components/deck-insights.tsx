"use client";

import { useState, useEffect } from "react";
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
import { getDeckStats } from "@/api/insights/insights";
import type { DeckStatsResponse } from "@/api/insights/insights";
import { toast } from "sonner";
import { ResponsivePie } from "@nivo/pie";

interface DeckInsightsProps {
  timeRange: string;
}

interface DeckStats {
  id: string;
  name: string;
  category: string;
  cards: number;
  reviews: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  avgEase: number;
  lastReviewed: string | null;
}

export default function DeckInsights({ timeRange }: DeckInsightsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("reviews");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deckStats, setDeckStats] = useState<DeckStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getDeckStats(timeRange);

        // Transform data to match our interface
        const transformedData: DeckStats[] = data.map(
          (stat: DeckStatsResponse) => ({
            id: stat.id,
            name: stat.name,
            category: stat.category_name,
            cards: stat.card_count,
            reviews: stat.total_reviews,
            correct: stat.correct_reviews,
            incorrect: stat.incorrect_reviews,
            accuracy: stat.accuracy,
            avgEase: stat.average_ease,
            lastReviewed: stat.last_reviewed,
          })
        );

        setDeckStats(transformedData);
      } catch (error) {
        console.error("Error fetching deck stats:", error);
        toast.error("Failed to load deck insights");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Get unique categories for filtering
  const categories = [
    "all",
    ...new Set(deckStats.map((deck) => deck.category)),
  ];

  // Filter decks based on search query and category
  const filteredDecks = deckStats.filter((deck) => {
    const matchesSearch = deck.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || deck.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
  const reviewsChartData = deckStats.map((deck) => ({
    deck: deck.name,
    correct: deck.correct,
    incorrect: deck.incorrect,
  }));

  const accuracyChartData = deckStats.map((deck) => ({
    id: deck.name,
    label: deck.name,
    value: deck.accuracy,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
  }));

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

  if (isLoading) {
    return <div>Loading insights...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews by Deck */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews by Deck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveBar
                data={reviewsChartData}
                keys={["correct", "incorrect"]}
                indexBy="deck"
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
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
                  legendOffset: -40,
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

        {/* Accuracy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsivePie
                data={accuracyChartData}
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

      {/* Decks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deck Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-2"
                  >
                    Name {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("category")}
                    className="flex items-center gap-2"
                  >
                    Category {getSortIcon("category")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("cards")}
                    className="flex items-center gap-2"
                  >
                    Cards {getSortIcon("cards")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("reviews")}
                    className="flex items-center gap-2"
                  >
                    Reviews {getSortIcon("reviews")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("accuracy")}
                    className="flex items-center gap-2"
                  >
                    Accuracy {getSortIcon("accuracy")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("avgEase")}
                    className="flex items-center gap-2"
                  >
                    Avg. Ease {getSortIcon("avgEase")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("lastReviewed")}
                    className="flex items-center gap-2"
                  >
                    Last Reviewed {getSortIcon("lastReviewed")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDecks.map((deck) => (
                <TableRow key={deck.id}>
                  <TableCell>{deck.name}</TableCell>
                  <TableCell>{deck.category}</TableCell>
                  <TableCell>{deck.cards}</TableCell>
                  <TableCell>{deck.reviews}</TableCell>
                  <TableCell>{deck.accuracy.toFixed(1)}%</TableCell>
                  <TableCell>{deck.avgEase.toFixed(2)}</TableCell>
                  <TableCell>
                    {deck.lastReviewed
                      ? new Date(deck.lastReviewed).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
