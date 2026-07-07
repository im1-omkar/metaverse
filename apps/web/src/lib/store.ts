import { create } from 'zustand';

// 1. Your hardcoded fallback state
const HARDCODED_INITIAL_STATE = {
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: true,
        }
    },
    images: [
        {
            name: 'chair',
            url: '../assets/items/chair.png'
        },
        {
            name: 'grey-bg',
            url: '../assets/tiles/grey.png'
        }
    ],
    sprite: [
        {
            name: 'harry',
            url: '../assets/sprites/harry.png',
            configs: {
                frameWidth: 1664 / 52,
                frameHeight: 48,
            }
        },
        {
            name: 'all-tiles',
            url: '../assets/tiles/all-tiles.png',
            configs: {
                frameWidth: 626 / 4,
                frameHeight: 626 / 4
            }
        },
        {
            name: 'walls',
            url: '../assets/tiles/walls.png',
            configs: {
                frameWidth: 64,
                frameHeight: 64
            }
        },
        // REMOVED STRAY COMMA HERE
        {
            name: 'computers',
            url: '../assets/items/computers.png',
            configs: {
                frameWidth: 96,
                frameHeight: 64
            }
        }
    ]
};

// 2. Define the structure
export interface MapData {
    width: number;
    height: number;
    physics?: any;
    images: { name: string; url: string }[];
    sprite: { name: string; url: string; configs?: { frameWidth: number; frameHeight: number } }[];
    interactiveObjects?: { type: string; x: number; y: number; frame?: number }[];
}

interface GameState {
    spaceId: string | null;
    mapData: MapData | null;
    isLoading: boolean;
    error: string | null;
    fetchInitialState: (spaceId: string) => Promise<void>;
}

// 3. Create the store
export const useGameStore = create<GameState>((set) => ({
    spaceId: null,
    mapData: null,
    isLoading: true,
    error: null,

    fetchInitialState: async (spaceId: string) => {
        set({ isLoading: true, spaceId, error: null });

        try {
            /* =========================================
            TODO: UNCOMMENT THIS WHEN HTTP SERVER IS READY
            =========================================
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${apiUrl}/spaces/${spaceId}`);
            
            if (!res.ok) throw new Error("Failed to fetch space data");
            
            const data: MapData = await res.json();
            =========================================
            */

            // --- HARDCODED FALLBACK LOGIC ---
            // Simulate a 500ms network delay so you can see your React loading state
            await new Promise((resolve) => setTimeout(resolve, 500));
            const data: MapData = HARDCODED_INITIAL_STATE;
            // --------------------------------

            set({ mapData: data, isLoading: false });
        } catch (error: any) {
            console.error(error);
            set({ error: error.message, isLoading: false });
        }
    }
}));