"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({
  open,
  onOpenChange,
}: SettingsModalProps) {
  const [settings, setSettings] = useState({
    apiKey: "",
    aiPrompt:
      "Evaluate the answer based on accuracy and completeness. Provide specific feedback on what was correct and what needs improvement.",
    darkMode: false,
    autoFlip: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = () => {
    // Save settings logic would go here
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange("apiKey", e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-gray-500">
              Required for AI grading functionality
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="aiPrompt">AI Grading Prompt</Label>
            <Textarea
              id="aiPrompt"
              value={settings.aiPrompt}
              onChange={(e) => handleChange("aiPrompt", e.target.value)}
              placeholder="Enter your custom AI grading prompt..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              Customize how the AI evaluates and responds to your answers
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode">Dark Mode</Label>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleChange("darkMode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoFlip">Auto-flip after grading</Label>
            <Switch
              id="autoFlip"
              checked={settings.autoFlip}
              onCheckedChange={(checked) => handleChange("autoFlip", checked)}
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
