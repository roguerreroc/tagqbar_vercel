'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      router.push('/dashboard');
      router.refresh(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#3DC879] relative overflow-hidden flex items-center">
      {/* Concentric Circles Background */}
      <div className="absolute top-[40%] left-0 -translate-y-1/2 -translate-x-1/3 w-[1200px] h-[1200px] rounded-full border-[80px] border-[#36B56D] opacity-40 z-0 pointer-events-none"></div>
      <div className="absolute top-[40%] left-0 -translate-y-1/2 -translate-x-1/3 w-[900px] h-[900px] rounded-full border-[60px] border-[#36B56D] opacity-40 z-0 pointer-events-none"></div>
      <div className="absolute top-[40%] left-0 -translate-y-1/2 -translate-x-1/3 w-[600px] h-[600px] rounded-full border-[40px] border-[#36B56D] opacity-40 z-0 pointer-events-none"></div>

      {/* Yellow Polygon */}
      <div className="absolute top-[10%] right-[-10%] w-[900px] h-[900px] bg-[#FCE14B] rounded-[80px] rotate-[35deg] z-0 transform skew-x-12 pointer-events-none"></div>

      {/* Bottom White Wave */}
      <div className="absolute bottom-[-5px] left-0 w-full z-10 leading-none pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 220" className="w-full h-auto block">
          <path fill="#ffffff" fillOpacity="1" d="M0,128L80,138.7C160,149,320,171,480,160C640,149,800,107,960,96C1120,85,1280,107,1360,117.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 pt-10 pb-20">
        
        {/* Left Column: Text & Login */}
        <div className="w-full lg:w-1/2 text-white flex flex-col pt-10">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full border-[3px] border-white flex flex-col items-center justify-center relative">
               <div className="w-6 h-6 rounded-full border-2 border-white"></div>
               <div className="absolute w-2 h-2 bg-[#3DC879] rounded-full bottom-2 right-2 border-2 border-white"></div>
            </div>
            <div className="leading-tight">
              <span className="text-2xl font-semibold tracking-wide block">AeroEmpaque</span>
              <span className="text-xl font-normal block">Partners</span>
            </div>
          </div>

          <h1 className="text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight drop-shadow-sm">
            Introduce <br /> Our New App
          </h1>
          
          <p className="text-white/95 text-lg mb-10 max-w-md font-medium leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis erat et quam iaculis faucibus at sit amet nibh. Vestibulum
          </p>

          <div className="flex gap-6 items-start">
            {/* Arrow Circle */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shrink-0 shadow-xl mt-4 hidden md:flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#3CC879]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Login Form */}
            <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-slate-800">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-1 ml-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3CC879] outline-none text-slate-800 font-medium transition-all"
                    placeholder="admin@aeroempaque.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-1 ml-2">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3CC879] outline-none text-slate-800 font-medium transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 rounded-xl p-3 text-sm text-center border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3CC879] hover:bg-[#32b068] text-white font-bold py-4 px-4 rounded-2xl transform transition-transform active:scale-95 disabled:opacity-70 mt-2 shadow-xl shadow-[#3CC879]/30"
                >
                  {loading ? 'Verificando...' : 'Acceder al Sistema'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Mobile Phone Mockup */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0 relative z-20">
           <div className="relative w-[340px] h-[700px] bg-[#111] rounded-[3rem] border-[14px] border-[#111] shadow-2xl overflow-hidden translate-y-8">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#111] rounded-b-3xl z-30 flex justify-center items-center gap-2">
                 <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
                 <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
              </div>
              
              {/* Image inside phone */}
              <img 
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600" 
                alt="Corporate App Demo" 
                className="w-full h-full object-cover"
              />
              
              {/* Overlay inside phone */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              
              {/* Hardware buttons outside screen */}
              <div className="absolute top-32 -left-[14px] w-1.5 h-12 bg-slate-800 rounded-l-md"></div>
              <div className="absolute top-48 -left-[14px] w-1.5 h-12 bg-slate-800 rounded-l-md"></div>
              <div className="absolute top-32 -right-[14px] w-1.5 h-16 bg-slate-800 rounded-r-md"></div>
           </div>
        </div>

      </div>
    </div>
  );
}
