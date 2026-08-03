'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { useMediaStore } from '@/lib/mediaStore'
import { Ellipsis, Mic, MicOff, Video, VideoOff } from 'lucide-react'

const Page = () => {
    const params = useParams();
    const spaceId = params.spaceId as string;
    const videoRef = useRef<HTMLVideoElement>(null);
    const { fetchInitialState, isLoading, error, mapData } = useGameStore();
    const gameInitialized = useRef(false);
    const stream = useMediaStore((state) => state.stream)
    const currentPlayer = useMediaStore((state) => state.currentPlayer)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    const router = useRouter();

    const streamRef = useRef(stream);
    useEffect(() => {
        streamRef.current = stream;
    }, [stream])

    const wsRef = useRef<WebSocket | null>(null);

    const [wsSetter, setWsSetter] = useState<((socket: WebSocket) => void) | null>(null);

    //  WEBRTC STATEs
    const peersRef = useRef<Record<string, RTCPeerConnection>>({});
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const myIdRef = useRef<string>("");

    // media toggle state
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    //media toggle handler
    const toggleAudio = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                // Toggle the enabled property
                audioTracks[0].enabled = !audioTracks[0].enabled;
                setIsAudioMuted(!audioTracks[0].enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                // Toggle the enabled property
                videoTracks[0].enabled = !videoTracks[0].enabled;
                setIsVideoOff(!videoTracks[0].enabled);
            }
        }
    };

    useEffect(() => {
        if (!stream || !currentPlayer) {
            router.push(`/space/${spaceId}/setup`)
        }
    }, [stream, currentPlayer, spaceId])

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isLoading, error])

    useEffect(() => {
        if (spaceId) {
            fetchInitialState(spaceId);
        }
    }, [spaceId, fetchInitialState]);

    useEffect(() => {
        let cleanupFn: (() => void) | undefined;
        let isMounted = true;

        async function init() {
            if (!isLoading && mapData && !gameInitialized.current) {
                gameInitialized.current = true;

                const { initializeGame } = await import("@/components/MainScene");

                if (!isMounted || !currentPlayer) {
                    return;
                }

                cleanupFn = initializeGame(spaceId, mapData, currentPlayer, (attachWsFunction) => {
                    if (isMounted) {
                        setWsSetter(() => attachWsFunction);
                    }
                });
            }
        }

        init();

        return () => {
            isMounted = false;

            if (cleanupFn) {
                cleanupFn();
            }
            gameInitialized.current = false;
        };
    }, [isLoading, mapData, spaceId, currentPlayer]);

    useEffect(() => {
        if (!wsSetter) return;

        const ws = new WebSocket(`${wsUrl}?spaceId=${spaceId}&sprite=${currentPlayer}`);
        wsRef.current = ws;

        wsSetter(ws);

        const createPeerConnection = (targetId: string) => {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            peersRef.current[targetId] = pc;

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => pc.addTrack(track, streamRef.current!));
            }

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    ws.send(JSON.stringify({
                        type: 'ice-candidate',
                        targetId: targetId,
                        senderId: myIdRef.current,
                        candidate: event.candidate
                    }));
                }
            };

            pc.ontrack = (event) => {
                setRemoteStreams((prev) => ({
                    ...prev,
                    [targetId]: event.streams[0]
                }));
            };

            return pc;
        };

        const handleWebRTCMessages = async (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'init':
                    myIdRef.current = data.id;
                    break;

                case 'player_joined':
                    const pcOffer = createPeerConnection(data.id);
                    const offer = await pcOffer.createOffer();
                    await pcOffer.setLocalDescription(offer);

                    ws.send(JSON.stringify({
                        type: 'offer',
                        targetId: data.id,
                        senderId: myIdRef.current,
                        sdp: pcOffer.localDescription
                    }));
                    break;

                case 'offer':
                    const pcAnswer = createPeerConnection(data.senderId);
                    await pcAnswer.setRemoteDescription(new RTCSessionDescription(data.sdp));

                    const answer = await pcAnswer.createAnswer();
                    await pcAnswer.setLocalDescription(answer);

                    ws.send(JSON.stringify({
                        type: 'answer',
                        targetId: data.senderId,
                        senderId: myIdRef.current,
                        sdp: pcAnswer.localDescription
                    }));
                    break;

                case 'answer':
                    const pc = peersRef.current[data.senderId];
                    if (pc) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    }
                    break;

                case 'ice-candidate':
                    const peerConnection = peersRef.current[data.senderId];
                    if (peerConnection && data.candidate) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                    break;

                case 'player_left':
                    if (peersRef.current[data.id]) {
                        peersRef.current[data.id].close();
                        delete peersRef.current[data.id];

                        setRemoteStreams((prev) => {
                            const newStreams = { ...prev };
                            delete newStreams[data.id];
                            return newStreams;
                        });
                    }
                    break;
            }
        };

        ws.addEventListener('message', handleWebRTCMessages);

        return () => {
            ws.removeEventListener('message', handleWebRTCMessages);
            ws.close();
        }
    }, [wsSetter, spaceId, wsUrl]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-mono text-xl animate-pulse">Loading Space...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 font-mono text-xl">Error: {error}</div>;

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-gray-900">

            {/* 1. FULL SCREEN GAME LAYER */}
            <div id="game-container" className="absolute inset-0 z-0" />

            {/* Title (Optional, just floating top-left so it doesn't break the layout) */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h1 className="text-2xl md:text-4xl text-white font-black drop-shadow-[2px_2px_0px_#000] tracking-wider font-mono">
                    MAIN OFFICE
                </h1>
            </div>

            {/* 2. FLOATING VIDEOS LAYER (TOP RIGHT) */}
            <div className="absolute top-6 right-6 z-10 flex flex-col items-end space-y-4 max-h-[80vh] overflow-y-auto p-2 pointer-events-auto">

                {/* Local Video */}
                <div className="relative w-40 md:w-56 rounded-xl overflow-hidden border-4 border-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] bg-gray-900 transition-transform hover:scale-105">
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] md:text-xs text-white font-bold z-10">
                        You
                    </div>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
                </div>

                {/* Remote Videos */}
                {Object.entries(remoteStreams).map(([peerId, remoteStream]) => (
                    <div key={peerId} className="relative w-40 md:w-56 rounded-xl overflow-hidden border-4 border-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] bg-gray-900 transition-transform hover:scale-105">
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] md:text-xs text-white font-bold z-10">
                            Player: {peerId.slice(0, 5)}...
                        </div>
                        <video
                            autoPlay
                            playsInline
                            className="w-full aspect-video object-cover"
                            ref={(videoElement) => {
                                if (videoElement && videoElement.srcObject !== remoteStream) {
                                    videoElement.srcObject = remoteStream;
                                }
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* 3. FLOATING CONTROLS (BOTTOM CENTER) */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-full border-4 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.5)] pointer-events-auto">
                <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-full font-bold text-white transition-all duration-200 hover:-translate-y-1 ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full font-bold text-white transition-all duration-200 hover:-translate-y-1 ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>

                <button className="p-4 rounded-full bg-gray-600 hover:bg-gray-500 transition-all duration-200 hover:-translate-y-1 text-white flex items-center justify-center">
                    <Ellipsis size={24} />
                </button>
            </div>

        </div>
    )
}

export default Page