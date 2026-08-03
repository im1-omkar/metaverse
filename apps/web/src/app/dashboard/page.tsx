'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const DashboardPage = () => {
   const router = useRouter()
   const API_URL = process.env.NEXT_PUBLIC_HTTP_URL || 'http://localhost:3001'

   const [isCheckingAuth, setIsCheckingAuth] = useState(true)
   const [userName, setUserName] = useState('GUEST')

   useEffect(() => {
      const checkAuth = async () => {
         const token = localStorage.getItem('token')

         if (!token) {
            router.replace('/')
            setIsCheckingAuth(false)
            return
         }

         try {
            const res = await fetch(`${API_URL}/api/users/me`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            })

            if (!res.ok) {
               localStorage.removeItem('token')
               router.replace('/')
               return
            }

            // Fetch user info from local storage
            const userStr = localStorage.getItem('metaverse_user')
            if (userStr) {
               const user = JSON.parse(userStr)
               if (user.displayName) {
                  setUserName(user.displayName)
               }
            }

         } catch (err) {
            console.error(err)
            router.replace('/')
         } finally {
            setIsCheckingAuth(false)
         }
      }

      checkAuth()
   }, [API_URL, router])

   const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('metaverse_user')
      router.replace('/')
   }

   const spaces = [
      {
         id: '123',
         name: 'Main Office',
         description: 'Your primary workspace. Collaborate and build in real-time.',
         imgSrc: '/assets/spaceImg/office123.png',
         isActive: true,
         redirectUrl: '/space/123/setup',
      },
      {
         id: '124',
         name: 'Conference Room',
         description: 'Secondary space for large team meetings. (Coming Soon)',
         imgSrc: '/assets/spaceImg/comingSoon.png',
         isActive: false,
         redirectUrl: '#',
      },
      {
         id: '125',
         name: 'Chill Lounge',
         description: 'Hangout area for casual interactions. (Coming Soon)',
         imgSrc: '/assets/spaceImg/comingSoon.png',
         isActive: false,
         redirectUrl: '#',
      },
   ]

   if (isCheckingAuth) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-[#94a3b8] font-mono">
            <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');` }} />
            <div className="text-xl md:text-2xl font-bold animate-pulse text-white drop-shadow-[2px_2px_0px_#000]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
               AUTHENTICATING...
            </div>
         </div>
      )
   }

   return (
      <>
         <style dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
            
            .pixel-font {
               font-family: 'Press Start 2P', cursive;
               image-rendering: pixelated;
            }
            
            /* Grid Background */
            .bg-pixel-grid {
               background-color: #94a3b8;
               background-image: 
               linear-gradient(to right, #64748b 1px, transparent 1px),
               linear-gradient(to bottom, #64748b 1px, transparent 1px);
               background-size: 40px 40px;
            }

            /* 3D Window/Wall */
            .room-wall {
               background-color: #e2e8f0;
               border: 6px solid #1e3a8a; 
               box-shadow: 
               16px 16px 0px rgba(0, 0, 0, 0.2),
               inset 4px 4px 0px rgba(255, 255, 255, 0.7), 
               inset -4px -4px 0px rgba(0, 0, 0, 0.2);
            }

            /* 3D Card */
            .retro-card {
               background-color: #f8fafc;
               border-top: 4px solid #ffffff;
               border-left: 4px solid #ffffff;
               border-right: 4px solid #475569;
               border-bottom: 4px solid #475569;
               transition: all 0.1s ease;
               box-shadow: 6px 6px 0px rgba(0,0,0,0.8);
            }
            .retro-card:active {
               border-top: 4px solid #475569;
               border-left: 4px solid #475569;
               border-right: 4px solid #ffffff;
               border-bottom: 4px solid #ffffff;
               transform: translate(4px, 4px);
               box-shadow: 2px 2px 0px rgba(0,0,0,0.8);
            }

            /* 3D Retro Button */
            .retro-button {
               background-color: #cbd5e1;
               border-top: 4px solid #ffffff;
               border-left: 4px solid #ffffff;
               border-right: 4px solid #475569;
               border-bottom: 4px solid #475569;
            }
            .retro-card:hover .retro-button {
               background-color: #94a3b8;
            }
         `}} />

         <div className="min-h-screen bg-pixel-grid text-black pixel-font flex flex-col relative overflow-hidden selection:bg-blue-800 selection:text-white">

            {/* Top Navigation Bar */}
            <nav className="w-full px-6 py-4 flex justify-between items-center bg-neutral-900 text-white border-b-8 border-black shadow-xl z-10 relative">
               <div className="text-sm md:text-xl text-blue-400 drop-shadow-[3px_3px_0px_#1e3a8a] tracking-wider">
                  NEXUS_WORLD
               </div>
               <div className="text-[8px] md:text-xs text-amber-400 uppercase tracking-wider flex items-center gap-4">
                  <span className="hidden md:inline-block border-2 border-amber-600 bg-amber-900/50 px-3 py-2">
                     PLAYER: {userName}
                  </span>
                  <span className="md:hidden">
                     {userName}
                  </span>
                  <button
                     onClick={handleLogout}
                     className="text-white hover:text-red-500 transition-colors"
                  >
                     [ LOGOUT ]
                  </button>
               </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center p-4 md:p-8 z-10 relative">
               <div className="relative room-wall p-8 md:p-12 max-w-6xl w-full">

                  {/* Corner Decorations */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-amber-500 border-4 border-purple-800 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"></div>
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-500 border-4 border-purple-800 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"></div>
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-amber-500 border-4 border-purple-800 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"></div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-amber-500 border-4 border-purple-800 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"></div>

                  <h1 className="text-xl md:text-3xl font-black text-center mb-12 tracking-widest uppercase drop-shadow-[2px_2px_0px_#94a3b8]">
                     SELECT YOUR SPACE
                  </h1>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                     {spaces.map((space) => (
                        <div
                           key={space.id}
                           onClick={() => {
                              if (!space.isActive) return
                              router.push(space.redirectUrl)
                           }}
                           className={`p-4 flex flex-col items-center text-center ${space.isActive
                                 ? 'retro-card cursor-pointer hover:-translate-y-2'
                                 : 'border-4 border-gray-500 bg-gray-300 opacity-80 cursor-not-allowed shadow-[4px_4px_0px_rgba(0,0,0,0.4)]'
                              }`}
                        >
                           {/* Thumbnail Container */}
                           <div className={`relative w-full h-40 border-4 mb-6 overflow-hidden ${space.isActive ? 'border-neutral-800' : 'border-gray-500 grayscale'
                              }`}>
                              <Image
                                 src={space.imgSrc}
                                 alt={space.name}
                                 fill
                                 className="object-cover"
                              />
                           </div>

                           <h2 className={`text-xs md:text-sm font-bold mb-4 uppercase tracking-wider h-10 flex items-center justify-center ${space.isActive ? 'text-black' : 'text-gray-600'
                              }`}>
                              {space.name}
                           </h2>

                           <p className={`text-[8px] md:text-[10px] leading-5 mb-8 flex-grow ${space.isActive ? 'text-neutral-700' : 'text-gray-600'
                              }`}>
                              {space.description}
                           </p>

                           {/* Action Button */}
                           {space.isActive ? (
                              <button className="retro-button w-full px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-black">
                                 ENTER SPACE
                              </button>
                           ) : (
                              <button
                                 disabled
                                 className="w-full bg-gray-400 border-t-4 border-l-4 border-gray-300 border-b-4 border-r-4 border-gray-500 px-4 py-4 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed text-gray-600"
                              >
                                 LOCKED
                              </button>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </main>
         </div>
      </>
   )
}

export default DashboardPage