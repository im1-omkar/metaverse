'use client'
import React, { useEffect } from 'react'

const Page = () => {
    useEffect(() => {
        async function init() {
            const { initializeGame } = await import("@/components/MainScene");
            initializeGame();
        }

        init();
    }, []);

    return <div id="game-container" />;
}

export default Page