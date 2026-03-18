import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    // Fetch activaciones with tipo_equipaje name via a join-like approach
    const { data: activaciones, error } = await supabaseAdmin
      .from('activaciones')
      .select('*')
      .order('fecharegistro', { ascending: false });

    if (error) throw error;

    // Fetch tipos_equipaje for display names
    const { data: tipos } = await supabaseAdmin
      .from('tipos_equipaje')
      .select('id, nombre');

    // Fetch etiquetas for tokens
    const { data: etiquetas } = await supabaseAdmin
      .from('etiquetas')
      .select('id, token');

    const tiposMap = new Map((tipos || []).map(t => [t.id, t.nombre]));
    const tokenMap = new Map((etiquetas || []).map(e => [e.id, e.token]));

    const enriched = (activaciones || []).map(a => ({
      ...a,
      tipo_nombre: tiposMap.get(a.tipoequipajeid) || 'Desconocido',
      etiqueta_token: tokenMap.get(a.etiquetaid) || ''
    }));

    return NextResponse.json({ success: true, activaciones: enriched });
  } catch (error) {
    console.error('Error fetching activaciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const decoded: any = verifyToken(token);
    if (!decoded || !['ADMIN', 'OPERADOR'].includes(decoded.rol)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id, reserva, vueloorigen, vuelodestino, tipoequipajeid, fechainicio, fechafin, preciocobrado } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID de activación requerido' }, { status: 400 });

    const updateData: any = {};
    if (reserva !== undefined) updateData.reserva = reserva;
    if (vueloorigen !== undefined) updateData.vueloorigen = vueloorigen;
    if (vuelodestino !== undefined) updateData.vuelodestino = vuelodestino;
    if (tipoequipajeid !== undefined) updateData.tipoequipajeid = tipoequipajeid;
    if (fechainicio !== undefined) updateData.fechainicio = fechainicio;
    if (fechafin !== undefined) updateData.fechafin = fechafin;
    if (preciocobrado !== undefined) updateData.preciocobrado = Number(preciocobrado);

    const { error: updateError } = await supabaseAdmin
      .from('activaciones')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;

    // Auditoría
    await supabaseAdmin
      .from('auditoria')
      .insert([{
        usuarioid: String(decoded.id),
        accion: 'MODIFICACION_ACTIVACION',
        detalles: `Activación ${id} modificada`,
        fecha: new Date().toISOString()
      }]);

    return NextResponse.json({ success: true, message: 'Activación actualizada correctamente' });
  } catch (error) {
    console.error('Error updating activación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
