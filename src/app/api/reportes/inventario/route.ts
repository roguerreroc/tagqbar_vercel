import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const decoded: any = verifyToken(token);
    if (!decoded || !['ADMIN', 'SUPERVISOR'].includes(decoded.rol)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }


    
    // Obtenemos el conteo total
    const { count: total, error: errTotal } = await supabaseAdmin
      .from('etiquetas')
      .select('*', { count: 'exact', head: true });

    // Obtenemos el conteo de activas
    const { count: activas, error: errActivas } = await supabaseAdmin
      .from('etiquetas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activa');

    // Obtenemos el conteo de inactivas
    const { count: inactivas, error: errInactivas } = await supabaseAdmin
      .from('etiquetas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'inactiva');
    
    if (errTotal || errActivas || errInactivas) throw new Error('Error al consultar base de datos');

    const stats = {
      total: total || 0,
      activas: activas || 0,
      inactivas: inactivas || 0
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
