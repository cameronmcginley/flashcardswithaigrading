"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Brain,
  FileJson,
  BarChart3,
  Settings,
  Target,
  Wand2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Clock
} from "lucide-react";

export default function FeatureGrid() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: <Brain className="h-10 w-10" />,
      title: "AI-Powered Grading",
      description: "GPT-4 evaluates your answers with contextual feedback and precise percentage scoring.",
      verified: "✓ Implemented",
      color: "from-purple-500 to-blue-600",
      highlights: [
        "Contextual feedback",
        "Percentage-based scoring",
        "Custom difficulty levels"
      ]
    },
    {
      icon: <Target className="h-10 w-10" />,
      title: "Smart Spaced Repetition",
      description: "Algorithm that adapts to AI grading for optimal review scheduling.",
      verified: "✓ Implemented",
      color: "from-green-500 to-emerald-600",
      highlights: [
        "AI-adapted SM-2 algorithm",
        "Dynamic ease factors",
        "Intelligent scheduling"
      ]
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Comprehensive Analytics",
      description: "Deep insights with category, deck, and card-level performance tracking.",
      verified: "✓ Implemented",
      color: "from-blue-500 to-cyan-600",
      highlights: [
        "Detailed performance metrics",
        "Visual progress charts",
        "Trend analysis"
      ]
    },
    {
      icon: <Settings className="h-10 w-10" />,
      title: "Full AI Customization",
      description: "Complete control over AI prompts and grading difficulty settings.",
      verified: "✓ Implemented",
      color: "from-orange-500 to-red-600",
      highlights: [
        "Custom AI prompts",
        "Grading difficulty levels",
        "Auto-grade settings"
      ]
    },
    {
      icon: <FileJson className="h-10 w-10" />,
      title: "Bulk Import System",
      description: "Import hundreds of cards instantly via JSON format or simple forms.",
      verified: "✓ Implemented",
      color: "from-indigo-500 to-purple-600",
      highlights: [
        "JSON bulk import",
        "Form-based creation",
        "Validation & error handling"
      ]
    },
    {
      icon: <Wand2 className="h-10 w-10" />,
      title: "AI Deck Generator",
      description: "Generate complete flashcard decks from any topic using advanced AI.",
      verified: "✓ Implemented",
      color: "from-pink-500 to-rose-600",
      highlights: [
        "Topic-based generation",
        "Progressive difficulty",
        "Multiple subjects"
      ]
    },
    {
      icon: <FileText className="h-10 w-10" />,
      title: "Rich Content Support",
      description: "Full markdown, code highlighting, LaTeX math, and formatting support.",
      verified: "✓ Implemented",
      color: "from-teal-500 to-green-600",
      highlights: [
        "Markdown rendering",
        "Code syntax highlighting",
        "LaTeX math equations"
      ]
    },
    {
      icon: <Layers className="h-10 w-10" />,
      title: "Deck Organization",
      description: "Organize cards with categories, search, filtering, and reordering capabilities.",
      verified: "✓ Implemented",
      color: "from-yellow-500 to-orange-600",
      highlights: [
        "Category management",
        "Advanced search & filters",
        "Drag & drop reordering"
      ]
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          className="group"
        >
          <Card className="relative h-full overflow-hidden border bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Gradient background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <motion.div 
                  className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                >
                  {feature.verified}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold mt-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-gray-100 dark:group-hover:to-gray-300 transition-all duration-300">
                {feature.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative">
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {feature.description}
              </p>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: hoveredCard === index ? 1 : 0, 
                  height: hoveredCard === index ? "auto" : 0 
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Key Features:
                  </p>
                  <ul className="space-y-1">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color} mr-2 flex-shrink-0`} />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
