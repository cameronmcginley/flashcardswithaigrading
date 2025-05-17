"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  Info,
  ChevronRight,
  ChevronDown,
  KeyRound,
  Bug,
  Clock,
  Layers,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

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
    simulateDelay?: boolean;
    simulateEmptyDecks?: boolean;
    gradingDifficulty: "beginner" | "adept" | "master";
  };
  onSettingsChange?: (settings: {
    apiKey: string;
    aiPrompt: string;
    darkMode: boolean;
    autoFlip: boolean;
    autoGrade: boolean;
    debugMode: boolean;
    simulateDelay?: boolean;
    simulateEmptyDecks?: boolean;
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
    simulateDelay: false,
    simulateEmptyDecks: false,
    gradingDifficulty: "adept" as "beginner" | "adept" | "master",
  });

  const [adminPowersOpen, setAdminPowersOpen] = useState(false);

  // Update local state when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setSettings({
        ...settings,
        ...initialSettings,
      });
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

    // If empty decks simulation was changed, reload the page
    if (initialSettings?.simulateEmptyDecks !== settings.simulateEmptyDecks) {
      window.location.reload();
    }
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

          {settings.debugMode && (
            <>
              <Separator className="my-2" />

              <Collapsible
                open={adminPowersOpen}
                onOpenChange={setAdminPowersOpen}
                className="border rounded-md p-3"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-amber-500" />
                    <h3 className="text-base font-medium">Admin Powers</h3>
                  </div>
                  {adminPowersOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <DialogDescription className="text-xs text-muted-foreground">
                    These debug features help simulate different app states for
                    testing purposes.
                  </DialogDescription>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <div>
                          <Label htmlFor="simulateDelay" className="text-sm">
                            Simulate Loading Delay
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Add 3 second delay on app load
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="simulateDelay"
                        checked={settings.simulateDelay}
                        onCheckedChange={(checked) =>
                          handleChange("simulateDelay", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-amber-500" />
                        <div>
                          <Label
                            htmlFor="simulateEmptyDecks"
                            className="text-sm"
                          >
                            Simulate Empty Decks
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Show only default category with no decks
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="simulateEmptyDecks"
                        checked={settings.simulateEmptyDecks}
                        onCheckedChange={(checked) =>
                          handleChange("simulateEmptyDecks", checked)
                        }
                      />
                    </div>

                    <div className="mt-4 bg-amber-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-amber-800 flex items-center gap-1 mb-2">
                        <Bug className="h-4 w-4" />
                        Debug Hotkeys
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-amber-800">
                            Toggle Loading Delay
                          </span>
                          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">
                            Shift + Alt + D
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-800">
                            Toggle Empty Decks
                          </span>
                          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">
                            Shift + Alt + E
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
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
