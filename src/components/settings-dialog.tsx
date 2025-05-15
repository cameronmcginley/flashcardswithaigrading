import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    apiKey: "",
    aiPrompt:
      "Evaluate the answer based on accuracy and completeness. Provide specific feedback on what was correct and what needs improvement.",
    darkMode: false,
    autoFlip: false,
    debugMode: false,
    autoGrade: false,
    gradingDifficulty: "adept" as "beginner" | "adept" | "master",
  });

  // ... existing useEffect ...

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your flashcard study preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* ... existing settings ... */}

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-grade"
              checked={settings.autoGrade}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoGrade: checked })
              }
            />
            <Label htmlFor="auto-grade">
              Auto-grade answers when flipping card
            </Label>
          </div>

          {/* ... rest of the settings ... */}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
