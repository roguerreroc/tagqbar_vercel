'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportesPage() {
  const [ventas, setVentas] = useState<any>({ total: 0, count: 0, data: [] });
  const [inventario, setInventario] = useState<any>({ total: 0, activas: 0, inactivas: 0 });
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchDatos = async () => {
    setLoading(true);
    let url = '/api/reportes/ventas';
    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    }

    try {
      const resVentas = await fetch(url);
      const dataVentas = await resVentas.json();
      if (dataVentas.success) setVentas(dataVentas);

      const resInv = await fetch('/api/reportes/inventario');
      const dataInv = await resInv.json();
      if (dataInv.success) setInventario(dataInv.stats);

    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDatos();
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(ventas.data.map((v: any) => ({
      ID_Venta: v.id,
      Etiqueta: v.etiquetaid,
      Reserva: v.reserva,
      Ruta: `${v.vueloorigen}-${v.vuelodestino}`,
      Fecha_Activacion: new Date(v.fecharegistro).toLocaleDateString(),
      Precio: v.preciocobrado
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, `Reporte_Aeroempaque_${Date.now()}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Ventas - AeroEmpaque", 14, 22);
    doc.setFontSize(12);
    doc.text(`Total Generado: $${ventas.total}`, 14, 30);
    doc.text(`Etiquetas Vendidas: ${ventas.count}`, 14, 38);

    const tableData = ventas.data.map((v: any) => [
      v.etiquetaid,
      v.vueloorigen + ' - ' + v.vuelodestino,
      v.reserva,
      new Date(v.fecharegistro).toLocaleDateString(),
      `$${v.preciocobrado}`
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [['ID Etiqueta', 'Ruta', 'Reserva', 'Fecha', 'Precio']],
      body: tableData,
    });

    doc.save(`Reporte_Aeroempaque_${Date.now()}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto mt-4 lg:mt-6 px-2 lg:px-0">
      <div className="mb-6 border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Reportes Consolidados</h1>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">Monitoree las ventas, activaciones y el inventario disponible.</p>
        </div>
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#FEEBE3] text-[#ED7044] rounded-2xl flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#E8F8EE] to-white rounded-2xl p-4 lg:p-6 border border-[#3CC879]/20 shadow-sm flex flex-col items-center justify-center text-center transition-all-smooth hover-lift">
          <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase mb-2 tracking-wider">Ingresos Totales</p>
          <p className="text-2xl lg:text-4xl font-extrabold text-[#3CC879]">${ventas.total}</p>
        </div>
        <div className="bg-gradient-to-br from-[#FEEBE3] to-white rounded-2xl p-4 lg:p-6 border border-[#ED7044]/20 shadow-sm flex flex-col items-center justify-center text-center transition-all-smooth hover-lift">
          <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase mb-2 tracking-wider">Activaciones</p>
          <p className="text-2xl lg:text-4xl font-extrabold text-[#ED7044]">{ventas.count}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center transition-all-smooth hover-lift">
          <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase mb-2 tracking-wider">Etiq. Inactivas</p>
          <p className="text-2xl lg:text-4xl font-extrabold text-slate-700">{inventario.inactivas}</p>
          <p className="text-[10px] lg:text-xs text-slate-400 mt-1">Stock para uso</p>
        </div>
        <div className="bg-gradient-to-br from-[#FFF9CC] to-white rounded-2xl p-4 lg:p-6 border border-[#D4B300]/20 shadow-sm flex flex-col items-center justify-center text-center transition-all-smooth hover-lift">
          <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase mb-2 tracking-wider">Etiq. Activas</p>
          <p className="text-2xl lg:text-4xl font-extrabold text-[#D4B300]">{inventario.activas}</p>
          <p className="text-[10px] lg:text-xs text-slate-400 mt-1">Pasajeros volando</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-8">
        <form onSubmit={handleFiltrar} className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
          <div className="grid grid-cols-2 gap-4 flex-grow">
            <div>
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">Desde</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#3CC879] focus:ring-2 focus:ring-[#3CC879] transition-all-smooth text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#3CC879] uppercase tracking-widest mb-2 ml-2">Hasta</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#3CC879] focus:ring-2 focus:ring-[#3CC879] transition-all-smooth text-sm" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-2 lg:mt-0 w-full lg:w-auto">
            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-[#E8F8EE] border border-[#3CC879]/30 text-[#2DA661] font-bold rounded-xl hover:bg-[#D1F1DE] transition-colors text-sm">
              Filtrar Rango
            </button>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button type="button" onClick={exportarExcel} disabled={ventas.data.length === 0} className="flex-1 sm:flex-none px-4 py-3 bg-[#ED7044] text-white font-bold rounded-xl hover:bg-[#D95F35] transition-colors shadow-lg shadow-[#ED7044]/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  XLSX
                </button>
                <button type="button" onClick={exportarPDF} disabled={ventas.data.length === 0} className="flex-1 sm:flex-none px-4 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF
                </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {loading ? (
           <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-[#3CC879] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando datos...
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4 font-bold text-[#3CC879]">ID</th>
                  <th className="px-6 py-4 font-bold">Reserva</th>
                  <th className="px-6 py-4 font-bold">Ruta</th>
                  <th className="px-6 py-4 font-bold">Fecha Activación</th>
                  <th className="px-6 py-4 font-bold text-[#ED7044]">Recaudo</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 text-sm">
                {ventas.data.map((v: any, i: number) => (
                  <tr key={v.id || i} className="border-b border-slate-100 hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">#{v.etiquetaid}</td>
                    <td className="px-6 py-4 font-medium uppercase">{v.reserva}</td>
                    <td className="px-6 py-4 font-semibold tracking-wide text-slate-600">
                      <span className="bg-slate-100 px-2 py-1 rounded-md">{v.vueloorigen}</span> 
                      <span className="mx-2 text-slate-300">&rarr;</span> 
                      <span className="bg-slate-100 px-2 py-1 rounded-md">{v.vuelodestino}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(v.fecharegistro).toLocaleString()}</td>
                    <td className="px-6 py-4 font-extrabold text-[#ED7044] bg-orange-50/30">${v.preciocobrado}</td>
                  </tr>
                ))}
                {ventas.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-lg font-bold text-slate-900">No hay registros</p>
                      <p className="text-slate-500 mt-1">No se encontraron ventas en el rango seleccionado.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
