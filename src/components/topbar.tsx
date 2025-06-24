"use client";

import { useState, useEffect } from "react";
import { Settings, LogOut, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "./settings-modal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface TopbarProps {
  onDebugModeChange?: (debugMode: boolean) => void;
}

export default function Topbar({ onDebugModeChange }: TopbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

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

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(
      "flashcardswithaigrading-settings"
    );
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({
        ...settings,
        ...parsedSettings,
        gradingDifficulty: parsedSettings.gradingDifficulty || "adept",
      });

      // Notify parent about debug mode
      if (onDebugModeChange) {
        onDebugModeChange(parsedSettings.debugMode);
      }
    }
  }, [onDebugModeChange]);

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem(
      "flashcardswithaigrading-settings",
      JSON.stringify(newSettings)
    );

    // Notify parent about debug mode changes
    if (onDebugModeChange && newSettings.debugMode !== settings.debugMode) {
      onDebugModeChange(newSettings.debugMode);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear any stored settings or user data
      localStorage.clear();
      // Sign out from Supabase
      await signOut();
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="h-14 border-b bg-white dark:bg-gray-800 flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="font-semibold text-lg hover:text-gray-600 transition-colors"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600">
            Flashcards with AI Grading
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/app" passHref>
            <Button
              variant={pathname === "/app" ? "default" : "ghost"}
              size="sm"
              className={
                pathname === "/app"
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  : ""
              }
            >
              App
            </Button>
          </Link>
          <Link href="/insights" passHref>
            <Button
              variant={pathname === "/insights" ? "default" : "ghost"}
              size="sm"
              className={
                pathname === "/insights"
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  : ""
              }
            >
              Insights
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link
            href="https://github.com/cameronmcginley/flashcardswithaigrading"
            target="_blank"
            rel="noopener noreferrer"
            className="p-0"
          >
            <Github className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="p-0"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="p-0"
        >
          <LogOut className="h-5 w-5" />
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
