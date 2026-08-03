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
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        setStream(stream)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }
      catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
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
    <div className="min-h-screen bg-[#b8b8b8] flex items-center justify-center p-2 sm:p-4">

      <div className="bg-[#f7f7f7] border-[6px] border-blue-700 shadow-xl w-full max-w-[900px] p-4 md:p-6 lg:p-8 max-h-[95vh] overflow-y-auto">

        <div className="text-center">

          <p className="uppercase tracking-[0.2em] md:tracking-[0.35em] text-xs md:text-sm text-gray-600">
            Selected Wizard
          </p>

          <h1 className="mt-1 lg:mt-2 text-3xl md:text-4xl lg:text-5xl uppercase font-black tracking-widest">
            {current.id}
          </h1>

          <div className="mt-2 lg:mt-3 inline-block px-3 py-1 lg:px-4 lg:py-1 border-2 border-green-700 bg-green-100 font-bold uppercase text-xs lg:text-sm">
            READY
          </div>

        </div>

        <div className="mt-4 md:mt-6 lg:mt-10 flex items-center justify-center gap-4 md:gap-8 lg:gap-10">

          <button
            onClick={prev}
            className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 border-4 border-blue-700 bg-[#dce5f3] hover:scale-105 transition flex items-center justify-center shrink-0"
          >
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10" />
          </button>

          <img
            src={current.image}
            alt={current.id}
            className="h-[180px] md:h-[240px] lg:h-[340px] object-contain select-none"
          />

          <button
            onClick={next}
            className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 border-4 border-blue-700 bg-[#dce5f3] hover:scale-105 transition flex items-center justify-center shrink-0"
          >
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10" />
          </button>

        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6 mt-6 md:mt-8 lg:mt-10">

          {players.map((player, index) => (

            <button
              key={player.id}
              onClick={() => setSelected(index)}
              className={`border-4 p-1 md:p-2 transition-all

                ${selected === index
                  ? 'border-blue-700 bg-blue-100 scale-110'
                  : 'border-gray-300 bg-white hover:border-blue-400'
                }
              `}
            >

              <img
                src={player.image}
                className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 object-contain"
              />

              <p className="uppercase font-bold text-[10px] md:text-xs lg:text-sm mt-1 lg:mt-2">
                {player.id}
              </p>

            </button>

          ))}

        </div>

        <div className="mt-6 md:mt-8 lg:mt-10 flex flex-col items-center">

          <p className="uppercase font-bold mb-2 lg:mb-3 text-xs md:text-sm tracking-widest">
            Camera Preview
          </p>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-40 md:w-56 lg:w-64 rounded border-4 border-blue-700"
          />

        </div>

        <div className="flex justify-center mt-6 md:mt-8 lg:mt-10">

          <button
            onClick={() => router.push('/space/123')}
            className="
              border-4
              border-blue-700
              bg-[#dce5f3]
              hover:bg-[#c7d8ef]
              px-8
              py-3
              lg:px-14
              lg:py-4
              text-lg
              md:text-xl
              lg:text-2xl
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