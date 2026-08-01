import { create } from "zustand";

interface MediaStore {
    currentPlayer : string | null;
    stream : MediaStream | null;
    setCurrentPlayer: (currentPlayer: string | null)=> void;
    setStream : (stream : MediaStream | null) => void;
}

export const useMediaStore = create<MediaStore>((set)=>({
    currentPlayer : "harry",
    stream : null as MediaStream | null,

    setCurrentPlayer: (currentPlayer: string) =>set({ currentPlayer }),
    setStream : (stream : MediaStream)=> set({stream}),
}));