// Test activaciones API
async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@qbar.com', password: 'admin123' }),
  });
  const cookies = loginRes.headers.getSetCookie();
  const authCookie = cookies.find(c => c.startsWith('auth_token='))?.split(';')[0];
  if (!authCookie) { console.log('❌ Login failed'); return; }
  console.log('✅ Login OK\n');

  // GET activaciones
  const res = await fetch('http://localhost:3000/api/activaciones', {
    headers: { 'Cookie': authCookie },
  });
  const data = await res.json();
  console.log(`[${res.status}] GET /api/activaciones`);
  console.log(`Total: ${data.activaciones?.length || 0} activaciones\n`);
  data.activaciones?.forEach(a => {
    console.log(`  Tag #${a.etiquetaid} | ${a.vueloorigen}→${a.vuelodestino} | PNR: ${a.reserva} | ${a.tipo_nombre} | $${a.preciocobrado}`);
  });
}

test().catch(console.error);
