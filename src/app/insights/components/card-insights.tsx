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
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
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
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CardInsightsProps {
  timeRange: string;
}

export default function CardInsights({ timeRange }: CardInsightsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("lastReviewed");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deckFilter, setDeckFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Mock data for cards
  const cardsData = [
    {
      id: "1",
      front: "What is a closure in JavaScript?",
      back: "A closure is a function that has access to its own scope, the scope of the outer function, and the global scope.",
      deck: "JavaScript",
      category: "Programming",
      reviews: 15,
      correct: 12,
      incorrect: 3,
      accuracy: 80.0,
      ease: 2.5,
      lastReviewed: "2023-05-10",
      nextReview: "2023-05-15",
    },
    {
      id: "2",
      front: "What is the difference between let and var in JavaScript?",
      back: "let is block-scoped while var is function-scoped. let was introduced in ES6.",
      deck: "JavaScript",
      category: "Programming",
      reviews: 12,
      correct: 8,
      incorrect: 4,
      accuracy: 66.7,
      ease: 2.1,
      lastReviewed: "2023-05-09",
      nextReview: "2023-05-13",
    },
    {
      id: "3",
      front: "What are Python decorators?",
      back: "Decorators are functions that modify the functionality of another function.",
      deck: "Python",
      category: "Programming",
      reviews: 10,
      correct: 7,
      incorrect: 3,
      accuracy: 70.0,
      ease: 2.2,
      lastReviewed: "2023-05-08",
      nextReview: "2023-05-12",
    },
    {
      id: "4",
      front: "What is JSX?",
      back: "JSX is a syntax extension for JavaScript that looks similar to HTML and is used with React to describe the UI.",
      deck: "React",
      category: "Programming",
      reviews: 8,
      correct: 7,
      incorrect: 1,
      accuracy: 87.5,
      ease: 2.7,
      lastReviewed: "2023-05-10",
      nextReview: "2023-05-16",
    },
    {
      id: "5",
      front: "¿Cómo estás?",
      back: "How are you?",
      deck: "Spanish",
      category: "Languages",
      reviews: 20,
      correct: 18,
      incorrect: 2,
      accuracy: 90.0,
      ease: 2.8,
      lastReviewed: "2023-05-09",
      nextReview: "2023-05-17",
    },
    {
      id: "6",
      front: "What is Newton's First Law?",
      back: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
      deck: "Physics",
      category: "Science",
      reviews: 15,
      correct: 10,
      incorrect: 5,
      accuracy: 66.7,
      ease: 2.0,
      lastReviewed: "2023-05-07",
      nextReview: "2023-05-10",
    },
    {
      id: "7",
      front: "What is the capital of France?",
      back: "Paris",
      deck: "Geography",
      category: "General Knowledge",
      reviews: 25,
      correct: 24,
      incorrect: 1,
      accuracy: 96.0,
      ease: 2.9,
      lastReviewed: "2023-05-08",
      nextReview: "2023-05-20",
    },
    {
      id: "8",
      front: "What is the formula for the area of a circle?",
      back: "A = πr²",
      deck: "Geometry",
      category: "Mathematics",
      reviews: 18,
      correct: 15,
      incorrect: 3,
      accuracy: 83.3,
      ease: 2.6,
      lastReviewed: "2023-05-06",
      nextReview: "2023-05-14",
    },
    {
      id: "9",
      front: "What is the difference between HTTP and HTTPS?",
      back: "HTTPS is HTTP with encryption. HTTPS uses SSL/TLS to encrypt normal HTTP requests and responses.",
      deck: "Web Development",
      category: "Programming",
      reviews: 12,
      correct: 9,
      incorrect: 3,
      accuracy: 75.0,
      ease: 2.3,
      lastReviewed: "2023-05-05",
      nextReview: "2023-05-11",
    },
    {
      id: "10",
      front: "What is photosynthesis?",
      back: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water.",
      deck: "Biology",
      category: "Science",
      reviews: 14,
      correct: 11,
      incorrect: 3,
      accuracy: 78.6,
      ease: 2.4,
      lastReviewed: "2023-05-04",
      nextReview: "2023-05-12",
    },
  ];

  // Get unique decks for filter
  const decks = ["All", ...new Set(cardsData.map((card) => card.deck))];

  // Define difficulty levels based on ease factor
  const getDifficulty = (ease: number) => {
    if (ease >= 2.6) return "Easy";
    if (ease >= 2.2) return "Medium";
    return "Hard";
  };

  // Add difficulty to each card
  const cardsWithDifficulty = cardsData.map((card) => ({
    ...card,
    difficulty: getDifficulty(card.ease),
  }));

  // Get unique difficulties for filter
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  // Filter cards based on search query, deck filter, and difficulty filter
  const filteredCards = cardsWithDifficulty.filter(
    (card) =>
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (deckFilter === "all" || card.deck === deckFilter) &&
      (difficultyFilter === "all" || card.difficulty === difficultyFilter)
  );

  // Sort cards based on sort column and direction
  const sortedCards = [...filteredCards].sort((a, b) => {
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

  // Prepare data for scatter plot
  const scatterData = [
    {
      id: "cards",
      data: cardsWithDifficulty.map((card) => ({
        x: card.ease,
        y: card.accuracy,
        deck: card.deck,
        front: card.front,
      })),
    },
  ];

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Ease vs Accuracy Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle>Card Performance Analysis</CardTitle>
            <CardDescription>
              Ease factor vs accuracy percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveScatterPlot
                data={scatterData}
                margin={{ top: 20, right: 140, bottom: 70, left: 90 }}
                xScale={{ type: "linear", min: 1.5, max: 3 }}
                yScale={{ type: "linear", min: 0, max: 100 }}
                blendMode="multiply"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Ease Factor",
                  legendPosition: "middle",
                  legendOffset: 46,
                  truncateTickAt: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Accuracy (%)",
                  legendPosition: "middle",
                  legendOffset: -60,
                  truncateTickAt: 0,
                }}
                tooltip={({ node }) => (
                  <div
                    style={{
                      background: "white",
                      padding: "9px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <div>Card: {node.data.front}</div>
                    <div>Deck: {node.data.deck}</div>
                    <div>Ease: {node.data.x}</div>
                    <div>Accuracy: {node.data.y}%</div>
                  </div>
                )}
                legends={[
                  {
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 130,
                    translateY: 0,
                    itemWidth: 100,
                    itemHeight: 12,
                    itemsSpacing: 5,
                    itemDirection: "left-to-right",
                    symbolSize: 12,
                    symbolShape: "circle",
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
      </div>

      {/* Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cards Performance</CardTitle>
          <CardDescription>Detailed statistics for all cards</CardDescription>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={deckFilter} onValueChange={setDeckFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by deck" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decks</SelectItem>
                  {decks
                    .filter((deck) => deck !== "All")
                    .map((deck) => (
                      <SelectItem key={deck} value={deck}>
                        {deck}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {difficulties
                    .filter((difficulty) => difficulty !== "All")
                    .map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("front")}
                    >
                      Card {getSortIcon("front")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("deck")}
                    >
                      Deck {getSortIcon("deck")}
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
                      onClick={() => handleSort("accuracy")}
                    >
                      Accuracy {getSortIcon("accuracy")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("ease")}
                    >
                      Ease {getSortIcon("ease")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => handleSort("difficulty")}
                    >
                      Difficulty {getSortIcon("difficulty")}
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
                {sortedCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium truncate max-w-[300px]">
                      {card.front}
                    </TableCell>
                    <TableCell>{card.deck}</TableCell>
                    <TableCell>{card.reviews}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={card.accuracy} className="h-2 w-16" />
                        <span>{card.accuracy.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{card.ease.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getDifficultyColor(
                          card.difficulty
                        )} text-white hover:${getDifficultyColor(
                          card.difficulty
                        )}`}
                      >
                        {card.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{card.lastReviewed}</TableCell>
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Card
                          </DropdownMenuItem>
                          <DropdownMenuItem>Study Now</DropdownMenuItem>
                          <DropdownMenuItem>Reset Statistics</DropdownMenuItem>
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
