'use client'
import React, { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useGameStore } from '@/lib/store'

const Page = () => {
    // 1. Get spaceId from the URL
    const params = useParams();
    const spaceId = params.spaceId as string;

    // 2. Connect to our Zustand store
    const { fetchInitialState, isLoading, error, mapData } = useGameStore();
    const gameInitialized = useRef(false);

    // 3. Fetch data from backend on mount
    useEffect(() => {
        if (spaceId) {
            fetchInitialState(spaceId);
        }
    }, [spaceId, fetchInitialState]);

    // 4. Initialize Phaser ONLY after data loads
    useEffect(() => {
        let cleanupFn: () => void;

        async function init() {
            if (!isLoading && mapData && !gameInitialized.current) {
                gameInitialized.current = true;
                const { initializeGame } = await import("@/components/MainScene");

                // Pass spaceId and mapData into your game
                cleanupFn = initializeGame(spaceId, mapData);
            }
        }

        init();

        // Cleanup Phaser on unmount
        return () => {
            if (cleanupFn) cleanupFn();
            gameInitialized.current = false;
        };
    }, [isLoading, mapData, spaceId]);

    // UI States
    if (isLoading) return <div className="p-10 text-white">Loading Space Data...</div>;
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

    return <div id="game-container" />;
}

export default Page