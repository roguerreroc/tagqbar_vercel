import { supabaseAdmin as supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import PublicPageClient from './PublicPageClient';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PublicEtiquetaPage({ params }: Props) {
  const { token } = await params;
  // Buscar la etiqueta por token
  const { data: etiqueta, error: etiquetaError } = await supabase
    .from('etiquetas')
    .select('*')
    .eq('token', token)
    .single();

  if (etiquetaError || !etiqueta) {
    return notFound();
  }

  // Buscar la activación actual si la etiqueta está activa
  let currentActivacion = null;
  let tipo = null;

  if (etiqueta.estado === 'activa') {
    const { data: activacion } = await supabase
      .from('activaciones')
      .select('*')
      .eq('etiquetaid', etiqueta.id)
      .order('fechainicio', { ascending: false })
      .limit(1)
      .single();

    if (activacion) {
      currentActivacion = activacion;
      
      // Obtener el tipo de equipaje
      if (activacion.tipoid) {
        const { data: tipoData } = await supabase
          .from('tipos_equipaje')
          .select('nombre')
          .eq('id', activacion.tipoid)
          .single();
        tipo = tipoData;
      }
    }
  }

  const flagIcons = {
    co: '/images/flags/co.png',
    us: '/images/flags/us.png'
  };

  return (
    <PublicPageClient 
      etiqueta={etiqueta} 
      currentActivacion={currentActivacion} 
      tipo={tipo} 
      flagIcons={flagIcons}
    />
  );
}
