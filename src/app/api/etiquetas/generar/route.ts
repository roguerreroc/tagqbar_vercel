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
    if (!decoded || decoded.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { startId, endId } = await req.json();

    if (!startId || !endId || startId > endId) {
      return NextResponse.json({ error: 'Rango numérico inválido' }, { status: 400 });
    }

    const start = Number(startId);
    const end = Number(endId);

    // Validar solapamiento directo en base de datos
    const { data: existingTags, error: searchError } = await supabaseAdmin
      .from('etiquetas')
      .select('id')
      .gte('id', String(start))
      .lte('id', String(end));
      
    if (searchError) throw new Error('Error al validar solapamiento');

    if (existingTags && existingTags.length > 0) {
      return NextResponse.json({ error: 'El rango especificado se solapa con etiquetas existentes' }, { status: 400 });
    }

    // Generar nuevas etiquetas
    const newTags = [];
    
    for (let i = start; i <= end; i++) {
      newTags.push({
        id: String(i),
        estado: 'inactiva'
      });
    }

    // Guardar en tabla de etiquetas
    const { error: insertError } = await supabaseAdmin
      .from('etiquetas')
      .insert(newTags);
      
    if (insertError) throw new Error('Error al insertar etiquetas en la base de datos');

    // Registrar en auditoría
    const auditData = {
      fecha: new Date().toISOString(),
      usuarioid: String(decoded.id),
      accion: 'GENERACION_ETIQUETAS',
      detalles: `Rango generado: ${start} al ${end} (${newTags.length} etiquetas)`
    };

    await supabaseAdmin
      .from('auditoria')
      .insert([auditData]);

    return NextResponse.json({ success: true, count: newTags.length });
  } catch (error) {
    console.error('Error generando etiquetas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
