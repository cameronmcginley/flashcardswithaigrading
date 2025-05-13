"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Topbar from "@/components/topbar";
import Sidebar from "./components/sidebar";
import MainArea from "./components/main-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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

  return (
    <div className="flex flex-col h-screen">
      <Topbar onDebugModeChange={setDebugMode} />
      <div className="flex-1 overflow-hidden relative">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-3 z-50 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Open sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <ResizablePanelGroup direction="horizontal">
          {isSidebarOpen && (
            <>
              <ResizablePanel
                defaultSize={25}
                minSize={15}
                maxSize={40}
                collapsible
                collapsedSize={5}
                onCollapse={() => setIsSidebarOpen(false)}
                className="min-w-[240px] max-w-[480px]"
              >
                <Sidebar
                  onSelectedDecksChange={handleSelectedDecksChange}
                  isOpen={isSidebarOpen}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          <ResizablePanel>
            <MainArea selectedDecks={selectedDecks} debugMode={debugMode} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
