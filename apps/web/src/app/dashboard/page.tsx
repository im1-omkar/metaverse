'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image";

const DashboardPage = () => {
   const router = useRouter()

   // Array to hold our space data. 
   // Currently, only the first one is active.
   const spaces = [
      {
         id: '123',
         name: 'Main Office',
         description: 'Your primary workspace. Collaborate and build in real-time.',
         imgSrc: '/assets/spaceImg/office123.png', 
         isActive: true,
         redirectUrl: '/space/123/setup'
      },
      {
         id: '124',
         name: 'Conference Room',
         description: 'Secondary space for large team meetings. (Coming Soon)',
         imgSrc: '/assets/spaceImg/comingSoon.png',
         isActive: false,
         redirectUrl: '#'
      },
      {
         id: '125',
         name: 'Chill Lounge',
         description: 'Hangout area for casual interactions. (Coming Soon)',
         imgSrc: '/assets/spaceImg/comingSoon.png',
         isActive: false,
         redirectUrl: '#'
      }
   ]

   return (
      // Background matching the landing page
      <div className="min-h-screen bg-[#9ca3af] flex flex-col items-center justify-center p-4 md:p-8 font-mono">

         {/* Main Retro Container */}
         <div className="relative bg-white border-[6px] border-blue-600 p-8 max-w-6xl w-full">

            {/* Corner Decorators (Orange with purple/dark border to match your image) */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#d97706] border-4 border-purple-800"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#d97706] border-4 border-purple-800"></div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#d97706] border-4 border-purple-800"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#d97706] border-4 border-purple-800"></div>

            <h1 className="text-3xl font-black text-center mb-10 tracking-widest uppercase">
               Select Your Space
            </h1>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {spaces.map((space, index) => (
                  <div
                     key={space.id}
                     onClick={() => space.isActive ? router.push(space.redirectUrl) : null}
                     className={`border-4 border-black p-4 flex flex-col items-center text-center transition-transform ${space.isActive
                           ? 'cursor-pointer hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white'
                           : 'opacity-70 cursor-not-allowed bg-gray-200'
                        }`}
                  >
                     {/* Image Placeholder */}
                     <div className="relative w-full h-40 border-2 border-dashed border-gray-600 mb-6 overflow-hidden">
                        <Image
                           src={space.imgSrc}
                           alt={space.name}
                           fill
                           className="object-cover"
                        />
                     </div>

                     <h2 className="text-xl font-bold mb-3 uppercase tracking-wider">
                        {space.name}
                     </h2>

                     <p className="text-sm text-gray-800 mb-6 flex-grow font-semibold">
                        {space.description}
                     </p>

                     {space.isActive ? (
                        <button className="bg-[#cbd5e1] border-2 border-black px-6 py-2 font-bold uppercase tracking-widest hover:bg-[#94a3b8] transition-colors">
                           Enter Space
                        </button>
                     ) : (
                        <button className="bg-gray-400 border-2 border-gray-600 px-6 py-2 font-bold uppercase tracking-widest cursor-not-allowed text-gray-600">
                           Locked
                        </button>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
}

export default DashboardPage