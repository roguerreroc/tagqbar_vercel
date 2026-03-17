import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: tipos, error } = await supabaseAdmin
      .from('tipos_equipaje')
      .select('*');

    if (error) throw new Error('Error al obtener tipos de equipaje');

    return NextResponse.json({ success: true, tipos });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
