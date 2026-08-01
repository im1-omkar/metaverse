'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMediaStore } from '@/lib/mediaStore'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const players = [
  {
    id: 'harry',
    image: '/assets/players/harry.png',
  },
  {
    id: 'ginny',
    image: '/assets/players/ginny.png',
  },
  {
    id: 'hermoine',
    image: '/assets/players/hermoine.png',
  },
  {
    id: 'ron',
    image: '/assets/players/ron.png',
  },
]

export default function Page() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const setStream = useMediaStore((s) => s.setStream)
  const setCurrentPlayer = useMediaStore((s) => s.setCurrentPlayer)

  const [selected, setSelected] = useState(0)

  const current = players[selected]

  useEffect(() => {
    setCurrentPlayer(current.id)
  }, [selected])

  useEffect(() => {
    const getMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setStream(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    }

    getMedia()
  }, [])

  const next = () => {
    setSelected((i) => (i + 1) % players.length)
  }

  const prev = () => {
    setSelected((i) => (i - 1 + players.length) % players.length)
  }

  return (
    <div className="min-h-screen bg-[#b8b8b8] flex items-center justify-center">

      <div className="bg-[#f7f7f7] border-[6px] border-blue-700 shadow-xl w-[900px] p-8">

        <div className="text-center">

          <p className="uppercase tracking-[0.35em] text-sm text-gray-600">
            Selected Wizard
          </p>

          <h1 className="mt-2 text-5xl uppercase font-black tracking-widest">
            {current.id}
          </h1>

          <div className="mt-3 inline-block px-4 py-1 border-2 border-green-700 bg-green-100 font-bold uppercase text-sm">
            READY
          </div>

        </div>

        <div className="mt-10 flex items-center justify-center gap-10">

          <button
            onClick={prev}
            className="h-20 w-20 border-4 border-blue-700 bg-[#dce5f3] hover:scale-105 transition"
          >
            <ChevronLeft className="h-10 w-10 mx-auto" />
          </button>

          <img
            src={current.image}
            alt={current.id}
            className="h-[340px] object-contain select-none"
          />

          <button
            onClick={next}
            className="h-20 w-20 border-4 border-blue-700 bg-[#dce5f3] hover:scale-105 transition"
          >
            <ChevronRight className="h-10 w-10 mx-auto" />
          </button>

        </div>

        <div className="flex justify-center gap-6 mt-10">

          {players.map((player, index) => (

            <button
              key={player.id}
              onClick={() => setSelected(index)}
              className={`border-4 p-2 transition-all

                ${selected === index
                  ? 'border-blue-700 bg-blue-100 scale-110'
                  : 'border-gray-300 bg-white hover:border-blue-400'
                }
              `}
            >

              <img
                src={player.image}
                className="h-20 w-20 object-contain"
              />

              <p className="uppercase font-bold text-sm mt-2">
                {player.id}
              </p>

            </button>

          ))}

        </div>

        <div className="mt-10 flex flex-col items-center">

          <p className="uppercase font-bold mb-3 tracking-widest">
            Camera Preview
          </p>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-64 rounded border-4 border-blue-700"
          />

        </div>

        <div className="flex justify-center mt-10">

          <button
            onClick={() => router.push('/space/123')}
            className="
              border-4
              border-blue-700
              bg-[#dce5f3]
              hover:bg-[#c7d8ef]
              px-14
              py-4
              text-2xl
              uppercase
              font-black
              tracking-widest
              transition
            "
          >
            Enter World
          </button>

        </div>

      </div>

    </div>
  )
}