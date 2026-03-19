'use client';

import { useState } from 'react';
import FoundButton from './FoundButton';

interface PublicPageClientProps {
  etiqueta: any;
  currentActivacion: any;
  tipo: any;
  flagIcons: {
    co: string;
    us: string;
  };
}

const DICTIONARY: any = {
  es: {
    status_label: 'Status Equipaje',
    origin: 'Origen',
    destination: 'Destino',
    pnr: 'PNR Reserva',
    bag_type: 'Tipo Equipaje',
    travel_date: 'Fecha de Viaje',
    tag_id: 'Etiqueta ID',
    active_status: 'Estado Validado',
    active_desc: 'Equipaje validado y en tránsito activo hacia el destino final.',
    inactive_title: 'Equipaje Inactivo',
    inactive_desc: 'Esta etiqueta no está asignada a ningún vuelo activo actualmente o su validez ya expiró.',
    footer_text: 'AEROEMPAQUE QR SYS',
    sys_ok: 'SYS-OK',
    found_btn: '¡Encontré este equipaje!',
    found_subtitle: 'Notificar al dueño ahora',
    loading: 'Procesando...',
    success_title: '¡Gracias por tu ayuda!',
    success_msg: 'Se ha notificado al dueño por correo y WhatsApp.',
    error_prefix: 'Error: ',
    found_desc: 'Tu aviso activa un protocolo de seguridad que informa al pasajero de inmediato.',
  },
  en: {
    status_label: 'Bag Status',
    origin: 'Origin',
    destination: 'Destination',
    pnr: 'PNR Booking',
    bag_type: 'Bag Type',
    travel_date: 'Travel Date',
    tag_id: 'Tag ID',
    active_status: 'Validated Status',
    active_desc: 'Luggage validated and in active transit to the final destination.',
    inactive_title: 'Inactive Luggage',
    inactive_desc: 'This tag is not currently assigned to any active flight or its validity has expired.',
    footer_text: 'AEROEMPAQUE QR SYS',
    sys_ok: 'SYS-OK',
    found_btn: 'I found this luggage!',
    found_subtitle: 'Notify the owner now',
    loading: 'Processing...',
    success_title: 'Thanks for your help!',
    success_msg: 'The owner has been notified via email and WhatsApp.',
    error_prefix: 'Error: ',
    found_desc: 'Your alert triggers a security protocol that informs the passenger immediately.',
  }
};

export default function PublicPageClient({ etiqueta, currentActivacion, tipo, flagIcons }: PublicPageClientProps) {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const t = DICTIONARY[lang];

  const hasContactInfo = !!(currentActivacion?.telefono_contacto || currentActivacion?.correo_contacto);

  return (
    <div className="min-h-screen bg-[#F0F4F8] py-4 px-4 font-sans flex flex-col items-center justify-start lg:justify-center gap-4">
      
      <div className="w-full max-w-md bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-100 relative transition-all-smooth hover-lift">
        {/* Cabecera */}
        <div className="bg-gradient-to-br from-[#1B243B] to-[#2A3757] p-5 text-white relative flex justify-between items-center overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-[#3CC879] opacity-20 rounded-full filter blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-32 h-32 bg-[#ED7044] opacity-10 rounded-full filter blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-xl font-black tracking-tighter">AEROEMPAQUE</h1>
            <p className="text-[#3CC879] text-[10px] font-bold tracking-widest uppercase mt-0.5">{t.status_label}</p>
          </div>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center relative z-10 border border-white/10 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3CC879]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Selector de idiomas - Reposicionado entre título y campos */}
        <div className="flex justify-center gap-6 py-2.5 bg-slate-50/50 border-b border-slate-100">
          <button 
            onClick={() => setLang('es')}
            className={`group flex flex-col items-center gap-0.5 transition-all duration-300 ${lang === 'es' ? 'scale-105' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}
          >
            <div className={`p-0.5 rounded-full ${lang === 'es' ? 'ring-1 ring-[#ED7044] ring-offset-1' : ''}`}>
              <img src={flagIcons.co} alt="ES" className="w-8 h-8 object-cover rounded-full shadow-sm" />
            </div>
            <span className={`text-[8px] font-black tracking-widest ${lang === 'es' ? 'text-[#ED7044]' : 'text-slate-400'}`}>ES</span>
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`group flex flex-col items-center gap-0.5 transition-all duration-300 ${lang === 'en' ? 'scale-105' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}
          >
            <div className={`p-0.5 rounded-full ${lang === 'en' ? 'ring-1 ring-[#4A7AE8] ring-offset-1' : ''}`}>
              <img src={flagIcons.us} alt="EN" className="w-8 h-8 object-cover rounded-full shadow-sm" />
            </div>
            <span className={`text-[8px] font-black tracking-widest ${lang === 'en' ? 'text-[#4A7AE8]' : 'text-slate-400'}`}>EN</span>
          </button>
        </div>

        {etiqueta.estado === 'activa' && currentActivacion ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-dashed border-slate-200 pb-6">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{currentActivacion.vueloorigen}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{t.origin}</p>
              </div>
              <div className="flex flex-col items-center justify-center text-[#3CC879]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transform rotate-90 drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{currentActivacion.vuelodestino}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{t.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-3 mb-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">{t.pnr}</p>
                <p className="text-base font-bold text-slate-800 font-mono tracking-tight">{currentActivacion.reserva}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col justify-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">{t.bag_type}</p>
                <div>
                  <span className="text-[10px] font-bold text-[#1B243B] bg-[#E8F8EE] border border-[#3CC879]/30 inline-block px-2 py-1 rounded-md">{tipo?.nombre || 'General'}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">{t.travel_date}</p>
                <p className="text-xs font-bold text-slate-800">{new Date(currentActivacion.fechainicio).toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US')}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">{t.tag_id}</p>
                <p className="text-xs font-bold text-slate-800 font-mono tracking-tighter">#{etiqueta.id}</p>
              </div>
            </div>

            {/* Acción de aviso de equipaje encontrado */}
            {hasContactInfo && (
              <FoundButton activacionId={currentActivacion.id} lang={lang} />
            )}
          </div>
        ) : (
          <div className="p-10 text-center bg-slate-50">
             <div className="w-20 h-20 bg-white rounded-2xl flex justify-center items-center mx-auto mb-4 shadow-sm border border-slate-100 transform -rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
             <h2 className="text-lg font-bold text-slate-800 mb-1">{t.inactive_title}</h2>
             <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto">{t.inactive_desc}</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="bg-[#1B243B] px-6 py-4 flex justify-between items-center text-slate-400 text-[9px] font-bold tracking-widest uppercase">
           <span>{t.footer_text}</span>
           <span className="font-mono text-[#3CC879] flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-[#3CC879] animate-pulse"></span>
             {t.sys_ok}
           </span>
        </div>
      </div>
    </div>
  );
}
