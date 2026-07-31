'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { useMediaStore } from '@/lib/mediaStore'

const Page = () => {
    // 1. Get spaceId from the URL
    const params = useParams();
    const spaceId = params.spaceId as string;
    const videoRef = useRef<HTMLVideoElement>(null);
    // 2. Connect to our Zustand store
    const { fetchInitialState, isLoading, error, mapData } = useGameStore();
    const gameInitialized = useRef(false);
    const stream = useMediaStore((state)=> state.stream)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(()=>{
        wsRef.current = new WebSocket(`${wsUrl}?spaceId=${spaceId}`);

        return ()=>{
            wsRef.current?.close;
        }
    },[])

    useEffect(()=>{
        
        if(videoRef.current && stream){
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    },[stream,isLoading, error])

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
                cleanupFn = initializeGame(spaceId, mapData, wsRef.current!);
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

    return<div className='flex h-screen w-screen'>
        <div className='flex-5 w-full h-screen flex flex-col justify-around items-center  '>
            <div className='text-6xl'>The Metaverse</div>
            <div id="game-container" />
            <div className='flex'>
                <div className='bg-red-500 h-20 w-20 m-10'></div>
                <div className='bg-red-500 h-20 w-20 m-10'></div>
                <div className='bg-red-500 h-20 w-20 m-10'></div>
            </div>
        </div>
        <div className='flex-1 flex  flex-col items-center m-5'>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className='w-full rounded-lg'
            />
        </div>
    </div>
}

export default Page