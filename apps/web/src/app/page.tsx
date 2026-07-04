"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    async function init() {
      const { initializeGame } = await import("@/components/MainScene");
      initializeGame();
    }

    init();
  }, []);

  return <div id="game-container" />;
}