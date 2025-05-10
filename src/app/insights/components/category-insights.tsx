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
import { ResponsivePie } from "@nivo/pie";
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

interface CategoryInsightsProps {
  timeRange: string;
}

export default function CategoryInsights({ timeRange }: CategoryInsightsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("reviews");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Mock data for categories
  const categoriesData = [
    {
      id: "1",
      name: "Programming",
      decks: 5,
      cards: 120,
      reviews: 450,
      correct: 380,
      incorrect: 70,
      accuracy: 84.4,
      avgEase: 2.4,
    },
    {
      id: "2",
      name: "Languages",
      decks: 3,
      cards: 85,
      reviews: 320,
      correct: 240,
      incorrect: 80,
      accuracy: 75.0,
      avgEase: 2.1,
    },
    {
      id: "3",
      name: "Science",
      decks: 4,
      cards: 95,
      reviews: 280,
      correct: 210,
      incorrect: 70,
      accuracy: 75.0,
      avgEase: 2.2,
    },
    {
      id: "4",
      name: "History",
      decks: 2,
      cards: 45,
      reviews: 120,
      correct: 90,
      incorrect: 30,
      accuracy: 75.0,
      avgEase: 2.3,
    },
    {
      id: "5",
      name: "Mathematics",
      decks: 3,
      cards: 60,
      reviews: 180,
      correct: 130,
      incorrect: 50,
      accuracy: 72.2,
      avgEase: 2.0,
    },
  ];

  // Filter categories based on search query
  const filteredCategories = categoriesData.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort categories based on sort column and direction
  const sortedCategories = [...filteredCategories].sort((a, b) => {
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
  const reviewsChartData = categoriesData.map((category) => ({
    category: category.name,
    correct: category.correct,
    incorrect: category.incorrect,
  }));

  const accuracyChartData = categoriesData.map((category) => ({
    id: category.name,
    label: category.name,
    value: category.accuracy,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews by Category</CardTitle>
            <CardDescription>Correct vs incorrect reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveBar
                data={reviewsChartData}
                keys={["correct", "incorrect"]}
                indexBy="category"
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
                  legend: "Category",
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

        {/* Accuracy by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by Category</CardTitle>
            <CardDescription>Percentage of correct answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsivePie
                data={accuracyChartData}
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
                valueFormat={(value) => `${value.toFixed(1)}%`}
                legends={[
                  {
                    anchor: "right",
                    direction: "column",
                    justify: false,
                    translateX: 0,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemWidth: 100,
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

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories Performance</CardTitle>
          <CardDescription>
            Detailed statistics for all categories
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("name")}
                    >
                      Category {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("decks")}
                    >
                      Decks {getSortIcon("decks")}
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
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.decks}</TableCell>
                    <TableCell>{category.cards}</TableCell>
                    <TableCell>{category.reviews}</TableCell>
                    <TableCell>{category.correct}</TableCell>
                    <TableCell>{category.incorrect}</TableCell>
                    <TableCell>{category.accuracy.toFixed(1)}%</TableCell>
                    <TableCell>{category.avgEase.toFixed(1)}</TableCell>
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
