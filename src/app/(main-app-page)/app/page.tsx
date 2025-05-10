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

  return (
    <Layout>
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSelectedDecksChange={setSelectedDecks} />
        <MainArea selectedDecks={selectedDecks} />
      </div>
    </Layout>
  );
}
