"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSettings?: {
    apiKey: string;
    aiPrompt: string;
    darkMode: boolean;
    autoFlip: boolean;
    autoGrade: boolean;
    debugMode: boolean;
    gradingDifficulty: "beginner" | "adept" | "master";
  };
  onSettingsChange?: (settings: {
    apiKey: string;
    aiPrompt: string;
    darkMode: boolean;
    autoFlip: boolean;
    autoGrade: boolean;
    debugMode: boolean;
    gradingDifficulty: "beginner" | "adept" | "master";
  }) => void;
}

export default function SettingsModal({
  open,
  onOpenChange,
  initialSettings,
  onSettingsChange,
}: SettingsModalProps) {
  const [settings, setSettings] = useState({
    apiKey: "",
    aiPrompt:
      "Evaluate the answer based on accuracy and completeness. Provide specific feedback on what was correct and what needs improvement.",
    darkMode: false,
    autoFlip: false,
    autoGrade: false,
    debugMode: false,
    gradingDifficulty: "adept" as "beginner" | "adept" | "master",
  });

  // Update local state when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (
    field: string,
    value: boolean | "beginner" | "adept" | "master"
  ) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = () => {
    // Notify parent about settings changes
    if (onSettingsChange) {
      onSettingsChange(settings);
    }

    // Save settings to localStorage
    localStorage.setItem("ez-anki-settings", JSON.stringify(settings));

    toast.success("Settings saved successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="gradingDifficulty" className="text-base">
                Grading Difficulty
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center cursor-help">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    className="max-w-[300px]"
                  >
                    <p className="text-sm">
                      Determines how strictly the AI will grade your answers
                      across all cards.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <RadioGroup
              value={settings.gradingDifficulty}
              onValueChange={(value) =>
                handleChange(
                  "gradingDifficulty",
                  value as "beginner" | "adept" | "master"
                )
              }
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="beginner" id="difficulty-beginner" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="difficulty-beginner" className="font-medium">
                    Beginner
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Lenient grading for new topics
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="adept" id="difficulty-adept" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="difficulty-adept" className="font-medium">
                    Adept
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Balanced grading for practice
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="master" id="difficulty-master" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="difficulty-master" className="font-medium">
                    Master
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Strict grading for mastery
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="autoGrade">Auto-grade Answers</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center cursor-help">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    className="max-w-[300px]"
                  >
                    <p className="text-sm">
                      Automatically grade answers when flipping cards to see the
                      answer.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="autoGrade"
              checked={settings.autoGrade}
              onCheckedChange={(checked) => handleChange("autoGrade", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="debugMode">Debug Mode</Label>
              <div className="text-xs text-gray-500">
                (Shows additional UI elements)
              </div>
            </div>
            <Switch
              id="debugMode"
              checked={settings.debugMode}
              onCheckedChange={(checked) => handleChange("debugMode", checked)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
