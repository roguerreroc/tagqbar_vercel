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

    const { data: etiquetas, error } = await supabaseAdmin
      .from('etiquetas')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, etiquetas: etiquetas || [] });
  } catch (error) {
    console.error('Error fetching etiquetas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
