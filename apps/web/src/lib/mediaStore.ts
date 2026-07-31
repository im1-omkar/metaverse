import { create } from "zustand";

interface MediaStore {
    stream : MediaStream | null;
    setStream : (stream : MediaStream | null) => void;
}

export const useMediaStore = create<MediaStore>((set)=>({
    stream : null as MediaStream | null,
    setStream : (stream : MediaStream)=> set({stream}),
}));