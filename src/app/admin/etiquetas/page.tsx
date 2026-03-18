'use client';

import { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';

interface Etiqueta {
  id: string;
  estado: string;
  fechacreacion: string;
  token: string;
}

function QRCell({ token }: { token: string }) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.origin : '';
    QRCode.toDataURL(`${host}/t/${token}`, {
      width: 120,
      margin: 1,
      color: { dark: '#1e293b', light: '#ffffff' }
    }).then(setQrUrl).catch(() => {});
  }, [token]);

  if (!qrUrl) return <div className="w-14 h-14 bg-slate-100 rounded-xl animate-pulse"></div>;

  return (
    <a href={`/t/${token}`} target="_blank" rel="noopener noreferrer" title="Ver etiqueta">
      <img
        src={qrUrl}
        alt="QR"
        className="w-14 h-14 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-110 transition-all cursor-pointer"
      />
    </a>
  );
}

export default function ListarEtiquetasPage() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'inactiva' | 'activa'>('todos');

  useEffect(() => {
    fetchEtiquetas();
  }, []);

  const fetchEtiquetas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/etiquetas');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al cargar etiquetas');

      setEtiquetas(data.etiquetas);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return etiquetas.filter(e => {
      const matchSearch = search === '' || e.id.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filterEstado === 'todos' || e.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [etiquetas, search, filterEstado]);

  const totalActivas = etiquetas.filter(e => e.estado === 'activa').length;
  const totalInactivas = etiquetas.filter(e => e.estado === 'inactiva').length;

  return (
    <div className="max-w-6xl mx-auto mt-4 lg:mt-10 px-2 lg:px-0">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-[#E0ECFF] rounded-xl text-[#4A7AE8]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:h-8 lg:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          Inventario de Etiquetas
        </h1>
        <p className="text-slate-500 mt-2 text-sm lg:text-base">Listado completo de todas las etiquetas QR generadas en el sistema.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#E0ECFF] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A7AE8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{etiquetas.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#E8F8EE] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3CC879]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3CC879]">{totalActivas}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Activas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#FFF3E0] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ED7044]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#ED7044]">{totalInactivas}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Inactivas</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por ID de etiqueta..."
                className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#4A7AE8] focus:border-transparent outline-none text-slate-800 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {(['todos', 'activa', 'inactiva'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => setFilterEstado(estado)}
                className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all flex-1 md:flex-none ${
                  filterEstado === estado
                    ? 'bg-[#4A7AE8] text-white shadow-lg shadow-[#4A7AE8]/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {estado === 'todos' ? 'Todos' : estado === 'activa' ? 'Activas' : 'Inactivas'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchEtiquetas}
            className="px-5 py-3 rounded-2xl bg-[#E8F8EE] text-[#3CC879] font-semibold text-sm hover:bg-[#d0f0da] transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-[#4A7AE8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-500 font-medium">Cargando etiquetas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl border border-red-100 inline-block">
              <p className="font-medium">{error}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-slate-500 text-lg font-medium">No se encontraron etiquetas</p>
              <p className="text-slate-400 text-sm mt-1">Ajuste los filtros o genere nuevas etiquetas</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">QR</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Creación</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">URL Pública</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((etiqueta) => (
                    <tr key={etiqueta.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <QRCell token={etiqueta.token} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-800 text-sm bg-slate-100 px-3 py-1 rounded-lg">
                          #{etiqueta.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          etiqueta.estado === 'activa' 
                            ? 'bg-[#E8F8EE] text-[#2DA661]' 
                            : 'bg-[#FFF3E0] text-[#D97B3B]'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${etiqueta.estado === 'activa' ? 'bg-[#3CC879]' : 'bg-[#ED7044]'}`}></span>
                          {etiqueta.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {etiqueta.fechacreacion 
                          ? new Date(etiqueta.fechacreacion).toLocaleDateString('es-CO', { 
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })
                          : '—'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={`/t/${etiqueta.token}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#4A7AE8] hover:text-[#3562C4] text-sm font-medium hover:underline flex items-center gap-1"
                        >
                          Ver etiqueta
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-sm text-slate-500">
              Mostrando <span className="font-bold text-slate-700">{filtered.length}</span> de <span className="font-bold text-slate-700">{etiquetas.length}</span> etiquetas
            </div>
          </>
        )}
      </div>
    </div>
  );
}
