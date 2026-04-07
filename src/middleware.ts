import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Archivos estáticos o de Next.js se ignoran en el matcher, pero validamos extras
  const isPublicRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/etiqueta') || 
    pathname.startsWith('/t/') || 
    pathname.startsWith('/api/activaciones/alertar');
  
  // Si no está autenticado y trata de acceder a rutas protegidas
  if (!token && !isPublicRoute) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si está logueado y va a /login, o a la raíz, redirigir al dashboard
  if (token && (pathname === '/login' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
