import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicEtiquetaPage({ params }: PageProps) {
  // Await params per Next.js 15+ convention for dynamic routes
  const { id } = await params;

  // Consultar la etiqueta específica
  const { data: etiqueta, error: tagError } = await supabaseAdmin
    .from('etiquetas')
    .select('*')
    .eq('id', id)
    .single();

  if (tagError || !etiqueta) {
    notFound();
  }

  // Track view (fire-and-forget)
  supabaseAdmin
    .from('auditoria')
    .insert([{
      accion: 'VISUALIZACION_ETIQUETA',
      detalles: `Visualización de etiqueta #${id}`,
      fecha: new Date().toISOString()
    }])
    .then(() => {});

  // Buscar la activación activa más reciente para esta etiqueta
  const { data: tagActivations, error: actError } = await supabaseAdmin
    .from('activaciones')
    .select('*')
    .eq('etiquetaid', id)
    .order('fecharegistro', { ascending: false })
    .limit(1);

  const currentActivacion = tagActivations && tagActivations.length > 0 ? tagActivations[0] : null;

  // Consultar tipo de equipaje asociado solo si hay activación
  let tipo = null;
  if (currentActivacion) {
    const { data: tipoData } = await supabaseAdmin
      .from('tipos_equipaje')
      .select('*')
      .eq('id', currentActivacion.tipoequipajeid)
      .single();
    tipo = tipoData;
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] py-10 px-4 font-sans flex items-start lg:items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 relative transition-all-smooth hover-lift">
        {/* Cabecera */}
        <div className="bg-gradient-to-br from-[#1B243B] to-[#2A3757] p-8 text-white relative flex justify-between items-center overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-[#3CC879] opacity-20 rounded-full filter blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-32 h-32 bg-[#ED7044] opacity-10 rounded-full filter blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-black tracking-tighter">AEROEMPAQUE</h1>
            <p className="text-[#3CC879] text-xs font-bold tracking-widest uppercase mt-1">Status Equipaje</p>
          </div>
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center relative z-10 border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3CC879]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {etiqueta.estado === 'activa' && currentActivacion ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b-2 border-dashed border-slate-200 pb-8">
              <div className="text-center">
                <p className="text-4xl font-black text-slate-800 tracking-tighter">{currentActivacion.vueloorigen}</p>
                <p className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-wider">Origen</p>
              </div>
              <div className="flex flex-col items-center justify-center text-[#3CC879]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-slate-800 tracking-tighter">{currentActivacion.vuelodestino}</p>
                <p className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-wider">Destino</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">PNR Reserva</p>
                <p className="text-lg font-bold text-slate-800 font-mono">{currentActivacion.reserva}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Tipo Equipaje</p>
                <div>
                  <span className="text-xs font-bold text-[#1B243B] bg-[#E8F8EE] border border-[#3CC879]/30 inline-block px-3 py-1.5 rounded-lg">{tipo?.nombre || 'General'}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Fecha de Viaje</p>
                <p className="text-sm font-bold text-slate-800">{new Date(currentActivacion.fechainicio).toLocaleDateString()}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Etiqueta ID</p>
                <p className="text-sm font-bold text-slate-800 font-mono">#{id}</p>
              </div>
            </div>
            
            <div className="mt-8 bg-[#E8F8EE] border border-[#3CC879]/30 rounded-2xl p-4 lg:p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 bg-[#3CC879] text-white rounded-xl flex shrink-0 items-center justify-center shadow-md shadow-[#3CC879]/40 mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B243B] mb-1">Estado Validado</p>
                <p className="text-xs font-medium text-[#2DA661] leading-relaxed">Equipaje validado y en tránsito activo hacia el destino final.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-50">
             <div className="w-24 h-24 bg-white rounded-3xl flex justify-center items-center mx-auto mb-6 shadow-sm border border-slate-100 transform -rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
             <h2 className="text-xl font-bold text-slate-800 mb-2">Equipaje Inactivo</h2>
             <p className="text-slate-500 text-sm leading-relaxed max-w-[250px] mx-auto">Esta etiqueta (#{id}) no está asignada a ningún vuelo activo actualmente o su validez ya expiró.</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="bg-[#1B243B] px-8 py-5 flex justify-between items-center text-slate-400 text-[10px] font-bold tracking-widest uppercase">
           <span>Aeroempaque QR Sys</span>
           <span className="font-mono text-[#3CC879] flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#3CC879] animate-pulse"></span>
             SYS-OK
           </span>
        </div>
      </div>
    </div>
  );
}
