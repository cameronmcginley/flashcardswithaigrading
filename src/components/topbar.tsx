"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsModal from "./settings-modal";

export default function Topbar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    </div>
  );
}
