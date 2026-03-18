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

    // Count active tags
    const { count: activas } = await supabaseAdmin
      .from('etiquetas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activa');

    // Count inactive tags
    const { count: inactivas } = await supabaseAdmin
      .from('etiquetas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'inactiva');

    // Count total tags
    const totalEtiquetas = (activas || 0) + (inactivas || 0);

    // Count activaciones this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: activacionesMes } = await supabaseAdmin
      .from('activaciones')
      .select('*', { count: 'exact', head: true })
      .gte('fecharegistro', firstOfMonth);

    // Count views this month (from auditoria with accion = 'VISUALIZACION_ETIQUETA')
    const { count: visualizacionesMes } = await supabaseAdmin
      .from('auditoria')
      .select('*', { count: 'exact', head: true })
      .eq('accion', 'VISUALIZACION_ETIQUETA')
      .gte('fecha', firstOfMonth);

    return NextResponse.json({
      success: true,
      stats: {
        activas: activas || 0,
        inactivas: inactivas || 0,
        totalEtiquetas,
        activacionesMes: activacionesMes || 0,
        visualizacionesMes: visualizacionesMes || 0,
      }
    });
  } catch (error) {
    console.error('Error stats:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
