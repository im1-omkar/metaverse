import { create } from "zustand";

interface MediaStore {
    currentPlayer : string | null;
    stream : MediaStream | null;
    setStream : (stream : MediaStream | null) => void;
}

export const useMediaStore = create<MediaStore>((set)=>({
    currentPlayer : "harry",
    stream : null as MediaStream | null,
    setStream : (stream : MediaStream)=> set({stream}),
}));