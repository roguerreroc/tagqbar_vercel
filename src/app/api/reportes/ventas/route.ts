import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const decoded: any = verifyToken(token);
    if (!decoded || !['ADMIN', 'SUPERVISOR'].includes(decoded.rol)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startObj = searchParams.get('start');
    const endObj = searchParams.get('end');



    let query = supabaseAdmin
      .from('activaciones')
      .select('*');

    if (startObj && endObj) {
      // Supabase supports querying by ISO 8601 Strings on dates/timestamps natively
      // So we append the timestamp to include the entire end day
      const startDate = new Date(startObj).toISOString();
      const endDateDate = new Date(endObj);
      endDateDate.setHours(23, 59, 59, 999);
      const endDate = endDateDate.toISOString();

      query = query.gte('fecharegistro', startDate).lte('fecharegistro', endDate);
    }

    const { data: activaciones, error } = await query;
    if (error) throw new Error('Error al obtener ventas');

    const totalVentas = (activaciones || []).reduce((sum: number, a: any) => sum + Number(a.preciocobrado || 0), 0);
    
    return NextResponse.json({ 
      success: true, 
      total: totalVentas, 
      count: (activaciones || []).length, 
      data: activaciones || [] 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
