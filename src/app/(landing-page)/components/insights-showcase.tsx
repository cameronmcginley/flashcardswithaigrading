"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Target, 
  Clock,
  Calendar,
  Trophy,
  Zap,
  Activity,
  ChevronRight
} from "lucide-react";

export default function InsightsShowcase() {
  const [activeView, setActiveView] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    accuracy: 87,
    streak: 14,
    totalCards: 156,
    weeklyProgress: 78
  });

  const views = [
    {
      id: "overview",
      title: "Performance Overview",
      icon: BarChart3,
      color: "bg-blue-500"
    },
    {
      id: "analytics",
      title: "Deep Analytics",
      icon: Brain,
      color: "bg-purple-500"
    },
    {
      id: "progress",
      title: "Progress Tracking",
      icon: TrendingUp,
      color: "bg-green-500"
    }
  ];

  const mockData = {
    weeklyData: [
      { day: "Mon", reviews: 12, accuracy: 85 },
      { day: "Tue", reviews: 8, accuracy: 92 },
      { day: "Wed", reviews: 15, accuracy: 78 },
      { day: "Thu", reviews: 10, accuracy: 88 },
      { day: "Fri", reviews: 18, accuracy: 94 },
      { day: "Sat", reviews: 6, accuracy: 90 },
      { day: "Sun", reviews: 14, accuracy: 87 }
    ],
    cardPerformance: [
      { topic: "React Hooks", mastery: 95, reviews: 24, trend: "up" },
      { topic: "TypeScript", mastery: 82, reviews: 18, trend: "up" },
      { topic: "Node.js", mastery: 76, reviews: 15, trend: "stable" },
      { topic: "GraphQL", mastery: 68, reviews: 12, trend: "down" }
    ],
    stats: {
      totalReviews: 1248,
      accuracy: 87,
      streak: 14,
      totalCards: 156,
      weeklyProgress: 78
    }
  };

  // Animate stats only on initial mount
  useEffect(() => {
    const animateStats = () => {
      setAnimatedStats({ accuracy: 0, streak: 0, totalCards: 0, weeklyProgress: 0 });
      
      const duration = 1000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedStats({
          accuracy: Math.round(mockData.stats.accuracy * progress),
          streak: Math.round(mockData.stats.streak * progress),
          totalCards: Math.round(mockData.stats.totalCards * progress),
          weeklyProgress: Math.round(mockData.stats.weeklyProgress * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);
    };

    animateStats();
  }, []); // Only run on initial mount

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 90) return "text-green-600 bg-green-100";
    if (mastery >= 80) return "text-blue-600 bg-blue-100";
    if (mastery >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down": return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <Target className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Navigation */}
        <Card className="border-2 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Smart Insights
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your learning progress with detailed analytics
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {views.map((view, index) => (
                <motion.div
                  key={view.id}
                  onClick={() => setActiveView(index)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeView === index 
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800' 
                      : 'bg-gray-50 dark:bg-gray-900 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${view.color}`}>
                      <view.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{view.title}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      activeView === index ? 'rotate-90' : ''
                    }`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <motion.div 
                  className="text-2xl font-bold text-blue-600"
                  key={animatedStats.accuracy}
                >
                  {animatedStats.accuracy}%
                </motion.div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Accuracy</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <motion.div 
                  className="text-2xl font-bold text-green-600"
                  key={animatedStats.streak}
                >
                  {animatedStats.streak}
                </motion.div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <div className="lg:col-span-2">
          <Card className="border-2 bg-white dark:bg-gray-800 min-h-[500px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = views[activeView].icon;
                    return <IconComponent className="h-5 w-5" />;
                  })()}
                  {views[activeView].title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {activeView === 0 && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Weekly Chart */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Weekly Activity
                      </h3>
                      <div className="flex items-end gap-2 h-32 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        {mockData.weeklyData.map((day, index) => (
                          <motion.div
                            key={day.day}
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.reviews / 20) * 100}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex-1 bg-blue-500 rounded-t-md min-h-[8px] relative group"
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {day.reviews} reviews
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        {mockData.weeklyData.map(day => (
                          <span key={day.day}>{day.day}</span>
                        ))}
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Total Reviews</span>
                        </div>
                        <motion.div 
                          className="text-2xl font-bold text-blue-600"
                          key={animatedStats.totalCards}
                        >
                          {animatedStats.totalCards.toLocaleString()}
                        </motion.div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Weekly Goal</span>
                        </div>
                        <motion.div className="text-2xl font-bold text-green-600">
                          {animatedStats.weeklyProgress}%
                        </motion.div>
                        <Progress value={animatedStats.weeklyProgress} className="mt-2 h-2" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeView === 1 && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Topic Mastery Analysis
                      </h3>
                      <div className="space-y-3">
                        {mockData.cardPerformance.map((topic, index) => (
                          <motion.div
                            key={topic.topic}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{topic.topic}</span>
                              <div className="flex items-center gap-2">
                                {getTrendIcon(topic.trend)}
                                <Badge className={getMasteryColor(topic.mastery)}>
                                  {topic.mastery}%
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{topic.reviews} reviews</span>
                              <Progress value={topic.mastery} className="flex-1 h-2" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeView === 2 && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Learning Velocity
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {animatedStats.streak}
                          </div>
                          <p className="text-sm text-purple-700 dark:text-purple-300">Day Streak</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Personal best: 21 days
                          </p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30 rounded-lg">
                          <div className="text-3xl font-bold text-orange-600 mb-2">4.2</div>
                          <p className="text-sm text-orange-700 dark:text-orange-300">Avg Ease</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Cards getting easier
                          </p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/30 rounded-lg">
                          <div className="text-3xl font-bold text-cyan-600 mb-2">2.1x</div>
                          <p className="text-sm text-cyan-700 dark:text-cyan-300">Speed Up</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Faster than last month
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          AI Insight
                        </span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Your performance on React concepts has improved 23% this week. 
                        Consider reviewing TypeScript basics to strengthen your foundation.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 