'use client'
import React, { useEffect, useState } from 'react';

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/users";

        const res = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("metaverse_user");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const toggleModal = (signup = false) => {
    setIsSignUp(signup);
    setShowModal(!showModal);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignUp ? '/signup' : '/signin';
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/users';

    const body = isSignUp
      ? { email, displayName, password }
      : { email, password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('metaverse_user', JSON.stringify(data.user));

      setShowModal(false);

      window.location.href = '/dashboard';

    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

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

        /* 3D Retro Button */
        .retro-button {
          background-color: #cbd5e1;
          border-top: 4px solid #ffffff;
          border-left: 4px solid #ffffff;
          border-right: 4px solid #475569;
          border-bottom: 4px solid #475569;
          transition: transform 0.1s, filter 0.1s;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.3);
        }
        .retro-button:hover {
          filter: brightness(1.05);
        }
        .retro-button:active {
          border-top: 4px solid #475569;
          border-left: 4px solid #475569;
          border-right: 4px solid #ffffff;
          border-bottom: 4px solid #ffffff;
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px rgba(0,0,0,0.3);
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

        /* Input Fields */
        .retro-input {
          background-color: #f8fafc;
          border-top: 4px solid #475569;
          border-left: 4px solid #475569;
          border-right: 4px solid #ffffff;
          border-bottom: 4px solid #ffffff;
        }
        .retro-input:focus {
          background-color: #ffffff;
          outline: none;
        }

        /* Animations */
        .blink {
          animation: blinker 1s step-start infinite;
        }
        @keyframes blinker {
          50% { opacity: 0; }
        }

        .float {
          animation: float 6s ease-in-out infinite;
        }
        .float-delayed {
          animation: float 7s ease-in-out infinite 2s;
        }
        .float-slow {
          animation: float 9s ease-in-out infinite 1s;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}} />

      <div className="min-h-screen bg-pixel-grid text-black pixel-font flex flex-col relative overflow-hidden selection:bg-blue-800 selection:text-white">

        {/* Background Decorative Elements */}
        <div className="absolute top-32 left-10 md:left-32 w-16 h-16 bg-blue-500/20 border-4 border-blue-600 float hidden md:block"></div>
        <div className="absolute bottom-32 right-10 md:right-40 w-24 h-24 bg-purple-500/20 border-4 border-purple-600 float-delayed hidden md:block"></div>
        <div className="absolute top-1/3 right-16 w-10 h-10 bg-amber-500/30 border-4 border-amber-600 float-slow hidden md:block"></div>

        {/* Navbar */}
        <nav className="w-full px-6 py-4 flex justify-between items-center bg-neutral-900 text-white border-b-8 border-black shadow-xl z-10 relative">
          <div className="text-sm md:text-xl text-blue-400 drop-shadow-[3px_3px_0px_#1e3a8a] tracking-wider">
            NEXUS_WORLD
          </div>
          <div className="space-x-4 flex items-center">
            {isCheckingAuth ? (
              <div className="text-[10px] md:text-xs uppercase text-blue-300 animate-pulse">
                SYSTEM_CHECK...
              </div>
            ) : isAuthenticated ? (
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="retro-button text-[10px] md:text-xs px-5 py-3 text-black uppercase font-bold"
              >
                Go To Space
              </button>
            ) : (
              <>
                <button
                  onClick={() => toggleModal(false)}
                  className="text-[10px] md:text-xs px-4 py-3 hover:text-blue-400 uppercase transition-colors"
                >
                  [ Login ]
                </button>
                <button
                  onClick={() => toggleModal(true)}
                  className="retro-button text-[10px] md:text-xs px-5 py-3 text-black uppercase font-bold"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center text-center p-4 z-10 relative">
          <div className="room-wall p-8 md:p-16 max-w-3xl relative mx-4">

            {/* Top left decorative block inside card */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-600 border-4 border-neutral-900 shadow-[4px_4px_0px_rgba(0,0,0,0.3)] flex items-center justify-center">
              <div className="w-4 h-4 bg-white/50"></div>
            </div>

            {/* Top right decorative block inside card */}
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-amber-500 border-4 border-neutral-900 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"></div>

            <h1 className="text-xl md:text-4xl lg:text-5xl leading-relaxed md:leading-tight mb-8 text-black drop-shadow-[3px_3px_0px_#94a3b8]">
              ENTER THE <br className="md:hidden" />
              <span className="text-blue-800">METAVERSE</span>
              <span className="blink text-blue-800">_</span>
            </h1>

            <p className="text-[10px] md:text-sm leading-6 md:leading-8 text-neutral-700 max-w-xl mx-auto mb-10 bg-slate-300 p-4 border-4 border-slate-400 shadow-inner">
              CONNECT TO THE MULTIPLAYER SERVER. COLLABORATE, BUILD YOUR DESK, AND INTERACT IN REAL-TIME.
            </p>

            <button
              onClick={() => {
                if (isAuthenticated) {
                  window.location.href = "/dashboard";
                } else {
                  toggleModal(true);
                }
              }}
              className="retro-button text-xs md:text-base px-10 py-6 text-black uppercase font-bold tracking-widest"
            >
              {isAuthenticated ? "INITIATE LAUNCH SEQUENCE" : "INSERT COIN TO START"}
            </button>
          </div>
        </main>

        {/* Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="room-wall w-full max-w-md p-8 relative animate-[float_0.5s_ease-out_forwards] shadow-[24px_24px_0px_rgba(0,0,0,0.5)]">

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-0 right-0 bg-red-500 border-l-4 border-b-4 border-neutral-900 text-white w-10 h-10 flex items-center justify-center hover:bg-red-600 active:bg-red-700 shadow-[-2px_2px_0px_rgba(0,0,0,0.2)]"
              >
                X
              </button>

              <h2 className="text-sm md:text-lg mb-8 text-black uppercase text-center border-b-4 border-blue-800 pb-4 tracking-wider">
                {isSignUp ? '> NEW PLAYER' : '> PLAYER LOGIN'}
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-200 border-4 border-red-600 text-red-900 text-[10px] uppercase leading-5 shadow-[2px_2px_0px_#b91c1c]">
                  <span className="font-bold">ERROR:</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] text-neutral-800 mb-2 uppercase font-bold">Display Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="retro-input w-full px-4 py-3 text-black text-[10px] placeholder-slate-400"
                      placeholder="PLAYER_1"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-neutral-800 mb-2 uppercase font-bold">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="retro-input w-full px-4 py-3 text-black text-[10px] placeholder-slate-400"
                    placeholder="USER@SERVER.COM"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-800 mb-2 uppercase font-bold">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="retro-input w-full px-4 py-3 text-black text-[10px] placeholder-slate-400"
                    placeholder="********"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="retro-button w-full py-5 text-black text-[10px] md:text-xs uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed tracking-widest"
                  >
                    {loading ? 'CONNECTING...' : (isSignUp ? 'REGISTER' : 'LOGIN')}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center text-[8px] md:text-[10px] text-neutral-600 uppercase leading-5 bg-slate-300 py-3 border-2 border-slate-400">
                {isSignUp ? "EXISTING USER? " : "NEW USER? "}
                <button
                  onClick={() => toggleModal(!isSignUp)}
                  className="text-blue-800 hover:text-blue-600 hover:underline font-bold ml-1"
                >
                  [{isSignUp ? 'LOGIN HERE' : 'REGISTER HERE'}]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}