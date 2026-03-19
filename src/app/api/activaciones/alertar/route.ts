import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { activacionId } = await req.json();

    if (!activacionId) {
      return NextResponse.json({ error: 'Falta ID de activación' }, { status: 400 });
    }

    // Obtener detalles de la activación
    const { data: act, error: actError } = await supabaseAdmin
      .from('activaciones')
      .select('*, etiquetaid')
      .eq('id', activacionId)
      .single();

    if (actError || !act) {
      return NextResponse.json({ error: 'Activación no encontrada' }, { status: 404 });
    }

    const hasPhone = !!act.telefono_contacto;
    const hasEmail = !!act.correo_contacto;

    if (!hasPhone && !hasEmail) {
      return NextResponse.json({ error: 'No hay datos de contacto para alertar' }, { status: 400 });
    }

    // Simular envío de alertas
    console.log(`[ALERT] Bag found for activation ${activacionId}`);
    if (hasEmail) {
      console.log(`[EMAIL] Sending to ${act.correo_contacto}: "Su equipaje se encontró gracias a QbarAeroempaque"`);
    }
    if (hasPhone) {
      console.log(`[WHATSAPP] Sending to ${act.telefono_contacto}: "Aviso de equipaje encontrado"`);
    }

    // Registrar en auditoría
    await supabaseAdmin
      .from('auditoria')
      .insert([{
        accion: 'AVISO_EQUIPAJE_ENCONTRADO',
        detalles: `Alerta disparada para etiqueta #${act.etiquetaid}. Email: ${hasEmail ? 'SI' : 'NO'}, WA: ${hasPhone ? 'SI' : 'NO'}`,
        fecha: new Date().toISOString()
      }]);

    return NextResponse.json({ 
      success: true, 
      message: 'Alertas enviadas correctamente',
      canales: { email: hasEmail, whatsapp: hasPhone }
    });

  } catch (error) {
    console.error('Error in alert endpoint:', error);
    return NextResponse.json({ error: 'Error interno al procesar la alerta' }, { status: 500 });
  }
}
