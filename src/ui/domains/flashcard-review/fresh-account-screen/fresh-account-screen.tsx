import {
  Plus,
  BookOpen,
  Sparkles,
  ArrowLeft,
  FolderPlus,
  Library,
  Layers,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface FreshAccountScreenProps {
  onAddDeck: () => void;
  onOpenMagicDeck: () => void;
}

export const FreshAccountScreen = ({
  onAddDeck,
  onOpenMagicDeck,
}: FreshAccountScreenProps) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative">
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-[15%] right-[15%] text-primary/20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Star className="h-12 w-12" />
      </motion.div>
      <motion.div
        className="absolute bottom-[20%] left-[20%] text-primary/20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Zap className="h-10 w-10" />
      </motion.div>

      {/* Arrow pointing to the sidebar */}
      <motion.div
        className="absolute left-10 top-[10%] hidden md:flex items-baseline"
        initial={{ x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex flex-row gap-2 items-center">
          <motion.div
            animate={{
              x: [0, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ArrowLeft className="h-8 w-8 text-primary" />
          </motion.div>
          <div className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium whitespace-nowrap">
            Manage your flashcards here!
          </div>
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-md flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Library className="h-12 w-12 text-white" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Let&apos;s build your knowledge library
        </motion.h2>
        <motion.p
          className="text-muted-foreground text-center mb-8 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Create categories to organize your flashcard decks and start
          building your personal learning system.
        </motion.p>

        <motion.div
          className="w-full bg-secondary/30 rounded-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold mb-4 flex items-center">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 w-6 h-6 text-primary text-sm mr-2">
              1
            </span>
            Getting Started
          </h3>

          <div className="grid gap-4 ml-8">
            <motion.div
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <FolderPlus className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Create categories</p>
                <p className="text-xs text-muted-foreground">
                  Organize subjects like &quot;Math&quot;,
                  &quot;Biology&quot;, or &quot;Spanish&quot;
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Layers className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Add decks to categories</p>
                <p className="text-xs text-muted-foreground">
                  Create decks for specific topics within each subject
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Create flashcards</p>
                <p className="text-xs text-muted-foreground">
                  Fill your decks with questions and answers to study
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col space-y-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onAddDeck}
            className="w-full bg-primary hover:bg-primary/90 relative overflow-hidden group"
            size="lg"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <Plus className="mr-2 h-4 w-4" />
            Create your first deck
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>
          <Button
            onClick={onOpenMagicDeck}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 relative overflow-hidden group"
            size="lg"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
