import { Card } from "@/components/ui/card";
import {
  FileJson,
  Edit3,
  Calendar,
  Brain,
  Zap,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";

export default function FeatureGrid() {
  const features = [
    {
      icon: <FileJson className="h-10 w-10" />,
      title: "Import Decks via JSON",
      description:
        "Easily import your existing flashcard decks from other apps using our JSON format.",
    },
    {
      icon: <Edit3 className="h-10 w-10" />,
      title: "Bulk Card Editing",
      description:
        "Edit multiple cards at once to save time and maintain consistency across your deck.",
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "SM-2 Algorithm",
      description:
        "Optimized spaced repetition scheduling based on the proven SuperMemo SM-2 algorithm.",
    },
    {
      icon: <Brain className="h-10 w-10" />,
      title: "Full OpenAI Prompt Control",
      description:
        "Customize how the AI evaluates your answers with complete control over prompts.",
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Learning Analytics",
      description:
        "Track your progress with detailed statistics and performance insights.",
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Offline Support",
      description:
        "Study anywhere with full offline functionality and automatic syncing.",
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: "Cross-Platform",
      description:
        "Access your flashcards from any device with our responsive web application.",
    },
    {
      icon: <Lock className="h-10 w-10" />,
      title: "Secure Cloud Storage",
      description:
        "Your flashcards are securely stored and backed up in the cloud.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <Card
          key={index}
          className="p-6 border bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
        >
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {feature.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {feature.description}
          </p>
        </Card>
      ))}
    </div>
  );
}
