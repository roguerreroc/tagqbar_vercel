'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'OPERADOR', 'SUPERVISOR'] },
    { name: 'Generar Etiquetas', path: '/admin/generar', roles: ['ADMIN'] },
    { name: 'Inventario Etiquetas', path: '/admin/etiquetas', roles: ['ADMIN', 'SUPERVISOR'] },
    { name: 'Activar Etiqueta', path: '/operador/activar', roles: ['ADMIN', 'OPERADOR'] },
    { name: 'Activaciones', path: '/operador/activaciones', roles: ['ADMIN', 'OPERADOR', 'SUPERVISOR'] },
    { name: 'Impresión QR', path: '/operador/imprimir', roles: ['ADMIN', 'OPERADOR'] },
    { name: 'Reportes', path: '/supervisor/reportes', roles: ['ADMIN', 'SUPERVISOR'] },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#1B243B] text-white lg:min-h-screen flex flex-col shadow-2xl z-20 shrink-0">
      <div className="p-6 border-b border-white/5 flex justify-between items-center lg:block">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#3CC879] flex items-center justify-center relative">
               <div className="w-3 h-3 rounded-full border border-white"></div>
            </div>
            AeroEmpaque
          </h2>
          <p className="text-xs text-[#3CC879] mt-1 uppercase tracking-wider font-bold">{user?.rol}</p>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible items-center lg:items-stretch">
        {menuItems
          .filter(item => !user || item.roles.includes(user.rol))
          .map((item) => {
            const isActive = pathname.startsWith(item.path) && item.path !== '/dashboard' || pathname === item.path;
            
            return (
              <Link key={item.path} href={item.path}
                className={`flex-shrink-0 lg:flex-shrink block px-4 py-3 rounded-2xl transition-all-smooth font-medium text-center lg:text-left ${
                  isActive 
                    ? 'bg-[#3CC879] text-white shadow-[0_0_15px_rgba(60,200,121,0.3)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
      </div>

      <div className="p-4 border-t border-white/5 hidden lg:block">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-[#ED7044] flex items-center justify-center text-white font-bold shadow-lg">
            {user?.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate text-white">{user?.nombre}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 mt-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
