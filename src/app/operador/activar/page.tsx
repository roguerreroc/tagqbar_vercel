'use client';

import { useState, useEffect } from 'react';

export default function ActivarEtiquetaPage() {
  const [formData, setFormData] = useState({
    etiquetaId: '',
    reserva: '',
    vueloOrigen: '',
    vueloDestino: '',
    tipoEquipajeId: '',
    fechaInicio: '',
    fechaFin: '',
    precioCobrado: ''
  });
  const [tipos, setTipos] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  useEffect(() => {
    fetch('/api/equipajes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tipos?.length > 0) {
          setTipos(data.tipos);
          setFormData(prev => ({ ...prev, tipoEquipajeId: data.tipos[0].id }));
        }
      })
      .catch();
    
    // Set default dates (Today and +1 Week)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    setFormData(prev => ({
      ...prev,
      fechaInicio: today.toISOString().split('T')[0],
      fechaFin: nextWeek.toISOString().split('T')[0]
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Activando etiqueta...' });

    try {
      const res = await fetch('/api/etiquetas/activar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al activar etiqueta');
      }

      setStatus({ type: 'success', message: `¡Éxito! Etiqueta ${formData.etiquetaId} activada correctamente.` });
      // Limpiar algunos campos manteniendo vuelo/fechas por comodidad
      setFormData(prev => ({ ...prev, etiquetaId: '', reserva: '' }));
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 lg:mt-6 px-2 lg:px-0">
      <div className="mb-6 border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Activar Etiqueta</h1>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">Vincule un código QR físico a la reserva de un pasajero.</p>
        </div>
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#E8F8EE] text-[#3CC879] rounded-2xl flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 lg:p-8 transition-all-smooth hover-lift">
        <form onSubmit={handleActivate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">ID de Etiqueta Escaneada</label>
              <div className="relative">
                <input
                  type="number"
                  name="etiquetaId"
                  required
                  autoFocus
                  className="w-full px-4 py-4 pl-14 bg-slate-50 border-2 border-dashed border-[#3CC879]/40 rounded-2xl focus:ring-4 focus:ring-[#3CC879]/20 focus:border-[#3CC879] outline-none text-slate-900 font-mono text-xl transition-all-smooth"
                  placeholder="Escanee o escriba el código..."
                  value={formData.etiquetaId}
                  onChange={handleChange}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3CC879] p-1 bg-white rounded-lg shadow-sm border border-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">Código de Reserva (PNR)</label>
              <input
                type="text"
                name="reserva"
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3CC879] outline-none uppercase font-mono transition-all-smooth"
                placeholder="Ej. XYZ123"
                value={formData.reserva}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">Tipo de Equipaje</label>
              <select
                name="tipoEquipajeId"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3CC879] outline-none appearance-none transition-all-smooth"
                value={formData.tipoEquipajeId}
                onChange={handleChange}
              >
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre} - ${t.precio}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">Aeropuerto Origen (IATA)</label>
              <input
                type="text"
                name="vueloOrigen"
                required
                maxLength={3}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3CC879] outline-none uppercase font-semibold tracking-wider transition-all-smooth"
                placeholder="BOG"
                value={formData.vueloOrigen}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">Aeropuerto Destino (IATA)</label>
              <input
                type="text"
                name="vueloDestino"
                required
                maxLength={3}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3CC879] outline-none uppercase font-semibold tracking-wider transition-all-smooth"
                placeholder="MDE"
                value={formData.vueloDestino}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">Validez Desde</label>
              <input
                type="date"
                name="fechaInicio"
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3CC879] outline-none transition-all-smooth"
                value={formData.fechaInicio}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">Validez Hasta</label>
              <input
                type="date"
                name="fechaFin"
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#3CC879] outline-none transition-all-smooth"
                value={formData.fechaFin}
                onChange={handleChange}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#ED7044] uppercase tracking-widest mb-2 ml-2">Precio Cobrado ($)</label>
              <input
                type="number"
                name="precioCobrado"
                min="0"
                className="w-full px-5 py-3 bg-orange-50/30 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-[#ED7044] outline-none text-xl font-bold text-[#ED7044] transition-all-smooth"
                placeholder="0"
                value={formData.precioCobrado}
                onChange={handleChange}
              />
            </div>

          </div>

          {status.type === 'error' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm animate-pulse flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {status.message}
            </div>
          )}

          {status.type === 'success' && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {status.message}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-right">
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="w-full md:w-auto px-10 py-4 bg-[#ED7044] hover:bg-[#D95F35] text-white font-bold rounded-2xl shadow-lg shadow-[#ED7044]/30 transform transition-all-smooth hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ml-auto text-base"
            >
               {status.type === 'loading' ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  Completar Activación
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
