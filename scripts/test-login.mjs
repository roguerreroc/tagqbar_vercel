// Test tag activation end-to-end
async function test() {
  // 1. Login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@qbar.com', password: 'admin123' }),
  });
  const cookies = loginRes.headers.getSetCookie();
  const authCookie = cookies.find(c => c.startsWith('auth_token='));
  if (!authCookie) { console.log('❌ Login failed'); return; }
  console.log('✅ Login OK');

  // 2. Get tipos_equipaje to use a valid UUID
  const tiposRes = await fetch('http://localhost:3000/api/equipajes', {
    headers: { 'Cookie': authCookie.split(';')[0] },
  });
  const tiposData = await tiposRes.json();
  const firstTipo = tiposData.tipos?.[0];
  console.log('✅ Tipos:', tiposData.tipos?.map(t => `${t.id} (${t.nombre})`).join(', '));

  // 3. Activate tag #131
  const activateRes = await fetch('http://localhost:3000/api/etiquetas/activar', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': authCookie.split(';')[0] 
    },
    body: JSON.stringify({
      etiquetaId: '131',
      reserva: 'TEST123',
      vueloOrigen: 'BOG',
      vueloDestino: 'MDE',
      tipoEquipajeId: firstTipo?.id || '1',
      fechaInicio: '2026-03-18',
      fechaFin: '2026-03-25',
      precioCobrado: 50
    }),
  });

  const activateData = await activateRes.json();
  const status = activateRes.status === 200 ? '✅' : '❌';
  console.log(`${status} [${activateRes.status}] Activate: ${JSON.stringify(activateData)}`);
}

test().catch(console.error);
