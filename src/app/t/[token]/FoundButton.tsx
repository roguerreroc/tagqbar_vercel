'use client';

import { useState } from 'react';

interface FoundButtonProps {
  activacionId: string;
  lang: 'es' | 'en';
}

const DICTIONARY = {
  es: {
    title: '¡Encontré este equipaje!',
    subtitle: 'Notificar al dueño ahora',
    loading: 'Enviando...',
    success_title: '¡Gracias!',
    success_msg: 'Dueño notificado por Email y WhatsApp.',
    error_prefix: 'Error: ',
    found_desc: 'Tu aviso activa un protocolo de seguridad inmediato.',
  },
  en: {
    title: 'I found this luggage!',
    subtitle: 'Notify the owner now',
    loading: 'Sending...',
    success_title: 'Thanks!',
    success_msg: 'Owner notified via Email and WhatsApp.',
    error_prefix: 'Error: ',
    found_desc: 'Your alert triggers an immediate security protocol.',
  }
};

export default function FoundButton({ activacionId, lang }: FoundButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const t = DICTIONARY[lang];

  const handleAlert = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/activaciones/alertar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activacionId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al enviar alerta');

      setStatus('success');
      setMessage(lang === 'es' ? data.message : t.success_msg);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="mt-4 bg-[#E8F8EE] border border-[#3CC879]/30 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-500 shadow-lg shadow-[#3CC879]/5">
        <div className="w-12 h-12 bg-[#3CC879] text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#3CC879]/30 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-800 mb-1">{t.success_title}</h3>
        <p className="text-[11px] text-[#2DA661] font-semibold leading-relaxed">{message}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-100/10">
      <div className="relative">
        <button
          onClick={handleAlert}
          disabled={status === 'loading'}
          className={`
            w-full group relative flex flex-col items-center justify-center p-5 
            bg-white border-2 border-dashed border-[#ED7044]/30 rounded-[1.5rem] 
            transition-all duration-200 
            ${status === 'loading' ? 'opacity-70 grayscale cursor-wait' : 'hover:border-[#ED7044] hover:bg-orange-50/10 active:translate-y-1 active:shadow-none shadow-[0_6px_0_rgb(237,112,68,0.08)]'}
          `}
        >
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 
            ${status === 'loading' ? 'bg-slate-200 text-slate-400' : 'bg-[#FEEBE3] text-[#ED7044] group-hover:bg-[#ED7044] group-hover:text-white shadow-sm'}
          `}>
            {status === 'loading' ? (
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            )}
          </div>
          
          <h3 className="text-base font-black text-slate-800 tracking-tight">
            {status === 'loading' ? t.loading : t.title}
          </h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">
            {t.found_subtitle}
          </p>

          {status === 'error' && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
               {t.error_prefix}{message}
            </div>
          )}
        </button>
        
        <p className="mt-2.5 px-4 text-center text-[9px] font-medium text-slate-400 leading-relaxed italic opacity-80">
          {t.found_desc}
        </p>
      </div>
    </div>
  );
}
