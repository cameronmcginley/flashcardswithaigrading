"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsModal from "./settings-modal";

interface TopbarProps {
  onDebugModeChange?: (debugMode: boolean) => void;
}

export default function Topbar({ onDebugModeChange }: TopbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: "",
    aiPrompt:
      "Evaluate the answer based on accuracy and completeness. Provide specific feedback on what was correct and what needs improvement.",
    darkMode: false,
    autoFlip: false,
    debugMode: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("ez-anki-settings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);

      // Notify parent about debug mode
      if (onDebugModeChange) {
        onDebugModeChange(parsedSettings.debugMode);
      }
    }
  }, [onDebugModeChange]);

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem("ez-anki-settings", JSON.stringify(newSettings));

    // Notify parent about debug mode changes
    if (onDebugModeChange && newSettings.debugMode !== settings.debugMode) {
      onDebugModeChange(newSettings.debugMode);
    }
  };

  return (
    <div className="h-14 border-b bg-white dark:bg-gray-800 flex items-center justify-between px-4 py-2">
      <div className="font-semibold text-lg">EZ Anki</div>
      <div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <SettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          initialSettings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
}
