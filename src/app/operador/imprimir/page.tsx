'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

export default function ImprimirEtiquetasPage() {
  const [etiquetas, setEtiquetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  useEffect(() => {
    fetch('/api/etiquetas')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Filtramos solo las inactivas (sin asignar, listas para imprimir)
          const validas = data.etiquetas.filter((e: any) => e.estado === 'inactiva');
          setEtiquetas(validas);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSelection = (token: string) => {
    setSelectedTokens(prev => 
      prev.includes(token) ? prev.filter(item => item !== token) : [...prev, token]
    );
  };

  const toggleAll = () => {
    if (selectedTokens.length === etiquetas.length) {
      setSelectedTokens([]);
    } else {
      setSelectedTokens(etiquetas.map(e => e.token));
    }
  };

  const handleImprimir = async () => {
    if (selectedTokens.length === 0) return;
    
    setStatus({ type: 'loading', message: 'Generando documento PDF, por favor espere...' });
    
    try {
      // Configuramos PDF para formato de etiqueta pequeña (ej. 4x6 pulgadas ~ 100x150 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150]
      });

      for (let i = 0; i < selectedTokens.length; i++) {
        const token = selectedTokens[i];
        const etiqueta = etiquetas.find(e => e.token === token);
        const id = etiqueta?.id || '?';
        
        // El contenido del QR será la URL pública con token (no adivinable)
        const host = typeof window !== 'undefined' ? window.location.origin : 'https://aeroempaques.com';
        const urlPública = `${host}/t/${token}`;
        
        // Generar QR en DataURL
        const qrDataUrl = await QRCode.toDataURL(urlPública, {
          width: 300,
          margin: 1,
          color: {
            dark: '#1e293b', // Tailwind slate-800
            light: '#ffffff'
          }
        });

        if (i > 0) {
          pdf.addPage([100, 150], 'portrait');
        }

        // Diseño de la Etiqueta
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 100, 150, 'F');
        
        // Cabecera Aerolínea
        pdf.setFillColor(37, 99, 235); // Blue-600
        pdf.rect(0, 0, 100, 25, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("AEROEMPAQUES QR", 50, 15, { align: "center" });
        
        // Código QR en el centro
        pdf.addImage(qrDataUrl, 'PNG', 15, 35, 70, 70);
        
        // Instrucciones
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text("Escanee para ver detalles del equipaje", 50, 115, { align: "center" });
        
        // ID Número
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text(`TAG ID: ${id}`, 50, 130, { align: "center" });
        
        // Borde decorativo
        pdf.setDrawColor(203, 213, 225); // Slate-300
        pdf.setLineWidth(0.5);
        pdf.line(10, 140, 90, 140);
        
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        pdf.text("Gracias por volar con nosotros", 50, 145, { align: "center" });
      }

      // Descargar el PDF
      pdf.save(`Etiquetas_Equipaje_${Date.now()}.pdf`);
      setStatus({ type: 'success', message: 'PDF generado y descargado correctamente.' });
      
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: 'Hubo un error al generar los códigos QR.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-4 lg:mt-6 px-2 lg:px-0">
      <div className="mb-6 border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#FFF9CC] text-[#D4B300] rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Impresión de Etiquetas</h1>
            <p className="text-slate-500 mt-1 text-sm lg:text-base">Seleccione los rangos generados para exportar e imprimir.</p>
          </div>
        </div>
        <div className="flex gap-2 lg:gap-3 w-full md:w-auto">
          <button
            onClick={toggleAll}
            className="flex-1 md:flex-none px-4 py-3 lg:py-2 bg-slate-100 text-slate-700 font-bold rounded-xl lg:rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors text-sm lg:text-base"
          >
            {selectedTokens.length === etiquetas.length && etiquetas.length > 0 ? 'Deseleccionar' : 'Seleccionar Todos'}
          </button>
          <button
            onClick={handleImprimir}
            disabled={selectedTokens.length === 0 || status.type === 'loading'}
            className="flex-1 md:flex-none px-6 py-3 lg:py-2 bg-[#ED7044] text-white font-bold rounded-xl lg:rounded-lg hover:bg-[#D95F35] transition-all-smooth disabled:opacity-50 shadow-lg shadow-[#ED7044]/30 flex items-center justify-center gap-2 text-sm lg:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Imprimir ({selectedTokens.length})
          </button>
        </div>
      </div>

      {status.type === 'error' && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm animate-pulse flex items-center gap-2">
          {status.message}
        </div>
      )}

      {status.type === 'success' && (
        <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {status.message}
        </div>
      )}

      {status.type === 'loading' && (
        <div className="mb-6 bg-[#E8F8EE] text-[#2DA661] p-4 rounded-xl border border-[#3CC879]/30 text-sm flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-[#3CC879]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {status.message}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando inventario de etiquetas...</div>
        ) : etiquetas.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">No hay etiquetas inactivas</h3>
            <p className="text-slate-500 max-w-sm mt-1 text-sm lg:text-base">El administrador debe generar un rango numérico de lote antes de poder imprimir.</p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto p-2 lg:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4 p-2 lg:p-4">
              {etiquetas.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => toggleSelection(t.token)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center transition-all-smooth hover:-translate-y-1 ${
                    selectedTokens.includes(t.token) 
                      ? 'border-[#3CC879] bg-[#E8F8EE] shadow-[0_0_15px_rgba(60,200,121,0.2)]' 
                      : 'border-slate-100 bg-white hover:border-[#3CC879]/30 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mb-3 transition-colors ${
                    selectedTokens.includes(t.token) ? 'bg-[#3CC879] border-[#3CC879] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {selectedTokens.includes(t.token) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm lg:text-base font-mono font-bold text-slate-800">#{t.id}</span>
                  <span className="text-[10px] lg:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{t.estado}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
