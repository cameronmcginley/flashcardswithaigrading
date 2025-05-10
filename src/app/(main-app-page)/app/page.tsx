"use client";

import { useState } from "react";
import Layout from "./layout";
import Sidebar from "./components/sidebar";
import Topbar from "@/components/topbar";
import MainArea from "./components/main-area";

export default function FlashcardApp() {
  const [selectedDecks, setSelectedDecks] = useState<
    { deckId: string; cardCount: number }[]
  >([]);
  const [debugMode, setDebugMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Layout>
      <Topbar
        onDebugModeChange={setDebugMode}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onSelectedDecksChange={setSelectedDecks}
          isOpen={sidebarOpen}
        />
        <MainArea selectedDecks={selectedDecks} debugMode={debugMode} />
      </div>
    </Layout>
  );
}
