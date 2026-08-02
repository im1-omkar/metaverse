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
      if(err instanceof Error){
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
        .retro-button {
          background-color: #cbd5e1;
          border-top: 4px solid #f8fafc;
          border-left: 4px solid #f8fafc;
          border-right: 4px solid #64748b;
          border-bottom: 4px solid #64748b;
        }
        .retro-button:active {
          border-top: 4px solid #64748b;
          border-left: 4px solid #64748b;
          border-right: 4px solid #f8fafc;
          border-bottom: 4px solid #f8fafc;
        }
        .room-wall {
          background-color: #ffffff;
          border: 8px solid #2563eb; 
          box-shadow: 0 0 0 4px #1e40af inset, 0 0 0 4px #1e3a8a; 
        }
      `}} />

      <div className="min-h-screen bg-neutral-400 text-black pixel-font flex flex-col selection:bg-blue-800 selection:text-white">

        <nav className="w-full px-6 py-5 flex justify-between items-center bg-neutral-800 text-white border-b-8 border-neutral-900">
          <div className="text-sm md:text-xl text-blue-400 drop-shadow-[2px_2px_0px_#000]">
            NEXUS_WORLD
          </div>
          <div className="space-x-4 flex">
            {isCheckingAuth ? (
              <div className="text-[10px] md:text-xs uppercase">
                Checking...
              </div>
            ) : isAuthenticated ? (
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="retro-button text-[10px] md:text-xs px-4 py-3 text-black uppercase"
              >
                Go To Space
              </button>
            ) : (
              <>
                <button
                  onClick={() => toggleModal(false)}
                  className="text-[10px] md:text-xs px-4 py-3 hover:text-blue-400 uppercase"
                >
                  [ Login ]
                </button>

                <button
                  onClick={() => toggleModal(true)}
                  className="retro-button text-[10px] md:text-xs px-4 py-3 text-black uppercase"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </nav>

        <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <div className="room-wall p-8 md:p-12 max-w-2xl relative">
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-amber-700 border-4 border-purple-600 rounded-sm shadow-lg">
              <div className="w-full h-1/2 bg-amber-900 opacity-50"></div>
            </div>

            <h1 className="text-xl md:text-3xl leading-relaxed mb-8 text-black drop-shadow-[2px_2px_0px_#94a3b8]">
              ENTER THE METAVERSE
            </h1>
            <p className="text-[10px] md:text-xs leading-6 text-neutral-700 max-w-lg mx-auto mb-10">
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
              className="retro-button text-xs md:text-sm px-8 py-5 text-black uppercase"
            >
              {isAuthenticated ? "GO TO SPACE" : "START GAME"}
            </button>
          </div>
        </main>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="room-wall w-full max-w-md p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-xl text-black hover:text-blue-700"
              >
                X
              </button>

              <h2 className="text-sm md:text-base mb-8 text-black uppercase text-center border-b-4 border-blue-800 pb-4">
                {isSignUp ? 'NEW PLAYER' : 'PLAYER LOGIN'}
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-200 border-4 border-red-600 text-red-900 text-[10px] uppercase leading-5">
                  ERROR: {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] text-black mb-2 uppercase">Display Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-300 border-4 border-blue-900 focus:outline-none focus:bg-white text-black text-[10px] placeholder-slate-500"
                      placeholder="PLAYER_1"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-black mb-2 uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-300 border-4 border-blue-900 focus:outline-none focus:bg-white text-black text-[10px] placeholder-slate-500"
                    placeholder="USER@SERVER.COM"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-black mb-2 uppercase">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-300 border-4 border-blue-900 focus:outline-none focus:bg-white text-black text-[10px] placeholder-slate-500"
                    placeholder="********"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="retro-button w-full py-4 mt-2 text-black text-[10px] md:text-xs uppercase disabled:opacity-50"
                >
                  {loading ? 'CONNECTING...' : (isSignUp ? 'REGISTER' : 'LOGIN')}
                </button>
              </form>

              <div className="mt-8 text-center text-[8px] md:text-[10px] text-neutral-600 uppercase leading-5">
                {isSignUp ? "EXISTING USER? " : "NEW USER? "}
                <br className="block md:hidden" />
                <button
                  onClick={() => toggleModal(!isSignUp)}
                  className="text-blue-800 hover:text-blue-600 mt-2 md:mt-0"
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