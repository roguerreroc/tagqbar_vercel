'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

interface Stats {
  activas: number;
  inactivas: number;
  totalEtiquetas: number;
  activacionesMes: number;
  visualizacionesMes: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch('/api/etiquetas/clean').catch(() => {});
    
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const kpis = stats ? [
    {
      label: 'Etiquetas Activas',
      value: stats.activas,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgIcon: 'bg-[#E8F8EE]',
      textIcon: 'text-[#3CC879]',
      accent: '#3CC879',
    },
    {
      label: 'Etiquetas Inactivas',
      value: stats.inactivas,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgIcon: 'bg-[#FFF3E0]',
      textIcon: 'text-[#ED7044]',
      accent: '#ED7044',
    },
    {
      label: 'Visualizaciones del Mes',
      value: stats.visualizacionesMes,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      bgIcon: 'bg-[#E0ECFF]',
      textIcon: 'text-[#4A7AE8]',
      accent: '#4A7AE8',
    },
    {
      label: 'Activaciones del Mes',
      value: stats.activacionesMes,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgIcon: 'bg-[#FFF9CC]',
      textIcon: 'text-[#D4B300]',
      accent: '#D4B300',
    },
  ] : [];

  return (
    <div className="mt-4 lg:mt-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#3CC879] to-[#2DA661] rounded-3xl p-6 lg:p-8 text-white shadow-[0_15px_40px_rgba(60,200,121,0.25)] mb-8 relative overflow-hidden transition-all-smooth hover-lift">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-[-20px] bottom-[-50px] w-40 h-40 bg-[#FCE14B] opacity-20 rounded-full filter blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Bienvenido, {user?.nombre || 'Usuario'}</h1>
          <p className="text-white/90 max-w-2xl text-base lg:text-lg">
            Sistema de administración y gestión operativa de etiquetas QR.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-8 bg-slate-100 rounded-lg w-16 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          kpis.map((kpi, i) => (
            <div key={i} className="bg-white p-5 lg:p-6 rounded-3xl shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100 transition-all-smooth hover:-translate-y-1 group">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 ${kpi.bgIcon} ${kpi.textIcon} rounded-2xl transition-transform group-hover:scale-110`}>
                  {kpi.icon}
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight leading-none">{kpi.value}</p>
                  <p className="text-[10px] lg:text-xs text-slate-400 uppercase tracking-wider font-bold mt-1.5">{kpi.label}</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    backgroundColor: kpi.accent, 
                    width: `${stats && stats.totalEtiquetas > 0 ? Math.min(100, Math.max(8, (kpi.value / stats.totalEtiquetas) * 100)) : 8}%` 
                  }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex items-start gap-4 transition-all-smooth hover:-translate-y-1">
          <div className="p-3 bg-[#E8F8EE] text-[#3CC879] rounded-2xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
             </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Módulo Etiquetas</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">Genere y active etiquetas para el equipaje de los pasajeros.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex items-start gap-4 transition-all-smooth hover:-translate-y-1">
          <div className="p-3 bg-[#FFF9CC] text-[#D4B300] rounded-2xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" />
             </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Impresión</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">Imprima las etiquetas QR generadas de forma masiva en PDF.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex items-start gap-4 transition-all-smooth hover:-translate-y-1">
          <div className="p-3 bg-orange-50 text-[#ED7044] rounded-2xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Reportes</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">Consulte el estado de ventas e inventario en tiempo real.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
