"use client";

import { useState } from "react";
import Topbar from "@/components/topbar";
import InsightsPage from "./components/insights-page";

export default function Page() {
  const [debugMode, setDebugMode] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Topbar onDebugModeChange={setDebugMode} />
      <div className="flex-1 overflow-auto">
        <InsightsPage />
      </div>
    </div>
  );
}
