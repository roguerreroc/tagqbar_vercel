'use client';

import { useState, useEffect } from 'react';

interface Activacion {
  id: string;
  etiquetaid: string;
  reserva: string;
  vueloorigen: string;
  vuelodestino: string;
  tipoequipajeid: string;
  fechainicio: string;
  fechafin: string | null;
  preciocobrado: string;
  fecharegistro: string;
  tipo_nombre: string;
  etiqueta_token: string;
}

interface TipoEquipaje {
  id: string;
  nombre: string;
}

export default function ActivacionesPage() {
  const [activaciones, setActivaciones] = useState<Activacion[]>([]);
  const [tipos, setTipos] = useState<TipoEquipaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Activacion>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actRes, tiposRes] = await Promise.all([
        fetch('/api/activaciones'),
        fetch('/api/equipajes')
      ]);
      const actData = await actRes.json();
      const tiposData = await tiposRes.json();

      if (!actRes.ok) throw new Error(actData.error);
      setActivaciones(actData.activaciones);
      if (tiposData.success) setTipos(tiposData.tipos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (act: Activacion) => {
    setEditingId(act.id);
    setEditForm({
      reserva: act.reserva,
      vueloorigen: act.vueloorigen,
      vuelodestino: act.vuelodestino,
      tipoequipajeid: act.tipoequipajeid,
      fechainicio: act.fechainicio,
      fechafin: act.fechafin || '',
      preciocobrado: act.preciocobrado
    });
    setSuccessMsg('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/activaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Activación actualizada correctamente`);
      setEditingId(null);
      setEditForm({});
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto mt-4 lg:mt-10 px-2 lg:px-0">
      {/* Header */}
      <div className="mb-6 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFF3E0] rounded-xl text-[#ED7044]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:h-8 lg:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Activaciones</h1>
              <p className="text-slate-500 mt-1 text-sm">Gestión de etiquetas activadas — visualizar y modificar datos de viaje.</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-[#ED7044]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-500 font-medium">Cargando activaciones...</p>
          </div>
        </div>
      ) : activaciones.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center py-20">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500 text-lg font-medium">No hay activaciones registradas</p>
            <p className="text-slate-400 text-sm mt-1">Active una etiqueta para verla aquí</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activaciones.map((act) => {
            const isEditing = editingId === act.id;

            return (
              <div key={act.id} className={`bg-white rounded-3xl shadow-sm border transition-all ${isEditing ? 'border-[#ED7044] shadow-[0_0_20px_rgba(237,112,68,0.1)]' : 'border-slate-100 hover:shadow-md'}`}>
                {/* Card Header — always visible */}
                <div className="p-5 lg:p-6 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E8F8EE] text-[#3CC879] rounded-2xl flex items-center justify-center font-mono font-bold text-lg shadow-sm">
                      #{act.etiquetaid}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-slate-800 tracking-tight">{isEditing ? (editForm.vueloorigen || '') : act.vueloorigen}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3CC879]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="text-xl font-black text-slate-800 tracking-tight">{isEditing ? (editForm.vuelodestino || '') : act.vuelodestino}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Reserva: <span className="font-mono font-bold text-slate-600">{isEditing ? (editForm.reserva || '') : act.reserva}</span> · {new Date(act.fecharegistro).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(act)}
                        className="px-4 py-2 bg-[#FFF3E0] text-[#ED7044] font-semibold text-sm rounded-xl hover:bg-[#FFE8D6] transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-200 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="px-5 py-2 bg-[#3CC879] text-white font-semibold text-sm rounded-xl hover:bg-[#2DA661] transition-all shadow-lg shadow-[#3CC879]/20 disabled:opacity-60 flex items-center gap-2"
                        >
                          {saving ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Guardar
                        </button>
                      </>
                    )}
                    <a
                      href={`/t/${act.etiqueta_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#E0ECFF] text-[#4A7AE8] font-semibold text-sm rounded-xl hover:bg-[#D0DFFF] transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Ver QR
                    </a>
                  </div>
                </div>

                {/* Card Body — detail fields */}
                <div className="p-5 lg:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Reserva */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">PNR Reserva</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.reserva || ''}
                          onChange={(e) => handleEditChange('reserva', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ED7044] outline-none font-mono uppercase text-sm"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-800 font-mono bg-slate-50 px-3 py-2 rounded-xl">{act.reserva}</p>
                      )}
                    </div>

                    {/* Origen */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Origen</label>
                      {isEditing ? (
                        <input
                          type="text"
                          maxLength={3}
                          value={editForm.vueloorigen || ''}
                          onChange={(e) => handleEditChange('vueloorigen', e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ED7044] outline-none font-semibold uppercase tracking-wider text-sm"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl">{act.vueloorigen}</p>
                      )}
                    </div>

                    {/* Destino */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Destino</label>
                      {isEditing ? (
                        <input
                          type="text"
                          maxLength={3}
                          value={editForm.vuelodestino || ''}
                          onChange={(e) => handleEditChange('vuelodestino', e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ED7044] outline-none font-semibold uppercase tracking-wider text-sm"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl">{act.vuelodestino}</p>
                      )}
                    </div>

                    {/* Tipo Equipaje */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo Equipaje</label>
                      {isEditing ? (
                        <select
                          value={editForm.tipoequipajeid || ''}
                          onChange={(e) => handleEditChange('tipoequipajeid', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ED7044] outline-none text-sm appearance-none"
                        >
                          {tipos.map(t => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-xs font-bold text-[#1B243B] bg-[#E8F8EE] border border-[#3CC879]/30 px-3 py-2 rounded-xl">{act.tipo_nombre}</p>
                      )}
                    </div>

                    {/* Fecha Inicio */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Validez Desde</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.fechainicio || ''}
                          onChange={(e) => handleEditChange('fechainicio', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ED7044] outline-none text-sm"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl">{act.fechainicio}</p>
                      )}
                    </div>

                    {/* Fecha Fin */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Validez Hasta</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.fechafin || ''}
                          onChange={(e) => handleEditChange('fechafin', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ED7044] outline-none text-sm"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl">{act.fechafin || '—'}</p>
                      )}
                    </div>

                    {/* Precio */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Precio Cobrado</label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editForm.preciocobrado || ''}
                          onChange={(e) => handleEditChange('preciocobrado', e.target.value)}
                          className="w-full px-3 py-2 bg-orange-50/50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-[#ED7044] outline-none font-bold text-[#ED7044] text-sm"
                        />
                      ) : (
                        <p className="text-sm font-bold text-[#ED7044] bg-orange-50/50 border border-orange-100 px-3 py-2 rounded-xl">${Number(act.preciocobrado).toLocaleString()}</p>
                      )}
                    </div>

                    {/* Etiqueta ID */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tag ID</label>
                      <p className="text-sm font-bold text-slate-800 font-mono bg-slate-50 px-3 py-2 rounded-xl">#{act.etiquetaid}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
