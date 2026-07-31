'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { useMediaStore } from '@/lib/mediaStore'

const Page = () => {
    const params = useParams();
    const spaceId = params.spaceId as string;
    const videoRef = useRef<HTMLVideoElement>(null);
    const { fetchInitialState, isLoading, error, mapData } = useGameStore();
    const gameInitialized = useRef(false);
    const stream = useMediaStore((state) => state.stream)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

    const wsRef = useRef<WebSocket | null>(null);

    const [wsSetter, setWsSetter] = useState<((socket: WebSocket) => void) | null>(null);

    //  WEBRTC STATEs
    const peersRef = useRef<Record<string, RTCPeerConnection>>({});
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const myIdRef = useRef<string>("");

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    }, [stream, isLoading, error])

    useEffect(() => {
        if (spaceId) {
            fetchInitialState(spaceId);
        }
    }, [spaceId, fetchInitialState]);

    useEffect(() => {
        let cleanupFn: () => void;

        async function init() {
            if (!isLoading && mapData && !gameInitialized.current) {
                gameInitialized.current = true;
                const { initializeGame } = await import("@/components/MainScene");

                cleanupFn = initializeGame(spaceId, mapData, (attachWsFunction) => {
                    setWsSetter(() => attachWsFunction);
                });
            }
        }

        init();

        return () => {
            if (cleanupFn) cleanupFn();
            gameInitialized.current = false;
        };
    }, [isLoading, mapData, spaceId]);

    useEffect(() => {
        if (!wsSetter) return;

        const ws = new WebSocket(`${wsUrl}?spaceId=${spaceId}`);
        wsRef.current = ws;

        wsSetter(ws);

        const createPeerConnection = (targetId: string) => {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Public STUN server
            });

            peersRef.current[targetId] = pc;

            // Add our local audio/video tracks to the connection
            if (stream) {
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            }

            // Listen for local ICE candidates and send them to the remote peer
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    ws.send(JSON.stringify({
                        type: 'ice-candidate',
                        targetId: targetId,         // Who this is going to
                        senderId: myIdRef.current,  // Who this is from
                        candidate: event.candidate
                    }));
                }
            };

            // Listen for the remote peer's audio/video tracks
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
                    // Store our own ID when we first connect
                    myIdRef.current = data.id;
                    break;

                case 'player_joined':
                    // A new player joined! We are the caller. Create an offer.
                    const pcOffer = createPeerConnection(data.id);
                    const offer = await pcOffer.createOffer();
                    await pcOffer.setLocalDescription(offer);

                    ws.send(JSON.stringify({
                        type: 'offer',
                        targetId: data.id,         // Send to the new player
                        senderId: myIdRef.current, // Let them know who is calling
                        sdp: pcOffer.localDescription
                    }));
                    break;

                case 'offer':
                    // Someone called us! Create an answer.
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
                    // The person we called responded! Set their answer.
                    const pc = peersRef.current[data.senderId];
                    if (pc) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    }
                    break;

                case 'ice-candidate':
                    // The other person's browser found a network route. Add it.
                    const peerConnection = peersRef.current[data.senderId];
                    if (peerConnection && data.candidate) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                    break;

                case 'player_left':
                    // Clean up video stream and connection when someone leaves
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
        {/* VIDEO SIDEBAR */}
        <div className='flex-1 flex flex-col items-center m-5 space-y-4 overflow-y-auto'>
            <div className="w-full text-center font-bold">You</div>
            <video ref={videoRef} autoPlay playsInline muted className='w-full rounded-lg bg-gray-800' />

            {/* RENDER ALL REMOTE STREAMS AUTOMATICALLY */}
            {Object.entries(remoteStreams).map(([peerId, remoteStream]) => (
                <div key={peerId} className="w-full">
                    <div className="w-full text-center font-bold text-sm">Player: {peerId.slice(0, 5)}...</div>
                    <video
                        autoPlay
                        playsInline
                        className='w-full rounded-lg bg-gray-800'
                        ref={(videoElement) => {
                            // Assign the remote stream directly to the video element
                            if (videoElement && videoElement.srcObject !== remoteStream) {
                                videoElement.srcObject = remoteStream;
                            }
                        }}
                    />
                </div>
            ))}
        </div>
    </div>
    
}

export default Page