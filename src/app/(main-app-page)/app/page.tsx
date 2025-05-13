"use client";

import { useState } from "react";
import Topbar from "@/components/topbar";
import Sidebar from "./components/sidebar";
import MainArea from "./components/main-area";

export default function Home() {
  const [selectedDecks, setSelectedDecks] = useState<
    { deckId: string; cardCount: number }[]
  >([]);
  const [debugMode, setDebugMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSelectedDecksChange = (
    decks: { deckId: string; cardCount: number }[]
  ) => {
    setSelectedDecks(decks);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      <Topbar onDebugModeChange={setDebugMode} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onSelectedDecksChange={handleSelectedDecksChange}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
        <MainArea selectedDecks={selectedDecks} debugMode={debugMode} />
      </div>
    </div>
  );
}
