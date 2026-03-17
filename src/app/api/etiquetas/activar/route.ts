import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const decoded: any = verifyToken(token);
    if (!decoded || !['ADMIN', 'OPERADOR'].includes(decoded.rol)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { etiquetaId, reserva, vueloOrigen, vueloDestino, tipoEquipajeId, fechaInicio, fechaFin, precioCobrado } = await req.json();

    if (!etiquetaId || !reserva || !vueloOrigen || !vueloDestino || !tipoEquipajeId || !fechaInicio || !fechaFin) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const { data: etiqueta, error: findError } = await supabaseAdmin
      .from('etiquetas')
      .select('*')
      .eq('id', String(etiquetaId))
      .single();

    if (findError || !etiqueta) {
      return NextResponse.json({ error: 'La etiqueta especificada no existe en el inventario' }, { status: 404 });
    }

    if (etiqueta.estado === 'activa') {
      return NextResponse.json({ error: 'La etiqueta ya se encuentra activa para otro viaje' }, { status: 400 });
    }

    // Usar una transacción no es estrictamente necesario en este MVP si no hay alta concurrencia, 
    // pero idealmente se haría RPC. Haremos las promesas de actualización en orden.

    // 1. Actualizar estado de etiqueta
    const { error: updateError } = await supabaseAdmin
      .from('etiquetas')
      .update({ estado: 'activa' })
      .eq('id', String(etiquetaId));

    if (updateError) throw new Error('Error al actualizar la etiqueta');

    const date = new Date().toISOString();
    
    // 2. Registrar la activación
    const activacionData = {
      id: crypto.randomUUID(),
      etiquetaId: String(etiquetaId),
      reserva,
      vueloOrigen,
      vueloDestino,
      tipoEquipajeId: String(tipoEquipajeId),
      fechaInicio,
      fechaFin: fechaFin || null,
      operadorId: String(decoded.id),
      precioCobrado: Number(precioCobrado || 0),
      fechaRegistro: date
    };

    const { error: insertActError } = await supabaseAdmin
      .from('activaciones')
      .insert([activacionData]);

    if (insertActError) throw new Error('Error al registrar la activación');

    // 3. Auditoria
    const auditData = {
      id: crypto.randomUUID(),
      usuarioId: String(decoded.id),
      accion: 'ACTIVACION_ETIQUETA',
      detalles: `Etiqueta ${etiquetaId} activada para reserva ${reserva}`,
      fecha: date
    };

    await supabaseAdmin
      .from('auditoria')
      .insert([auditData]);

    return NextResponse.json({ success: true, message: 'Etiqueta activada correctamente' });

  } catch (error) {
    console.error('Error en activación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
