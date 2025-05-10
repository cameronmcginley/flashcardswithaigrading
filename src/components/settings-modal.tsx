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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSettings?: {
    apiKey: string;
    aiPrompt: string;
    darkMode: boolean;
    autoFlip: boolean;
    debugMode: boolean;
  };
  onSettingsChange?: (settings: {
    apiKey: string;
    aiPrompt: string;
    darkMode: boolean;
    autoFlip: boolean;
    debugMode: boolean;
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
    debugMode: false,
  });

  // Update local state when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (field: string, value: string | boolean) => {
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
