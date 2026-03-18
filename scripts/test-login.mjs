// Test the etiquetas listing API
async function test() {
  // First login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@qbar.com', password: 'admin123' }),
  });
  
  const cookies = loginRes.headers.getSetCookie();
  const authCookie = cookies.find(c => c.startsWith('auth_token='));
  
  if (!authCookie) {
    console.log('❌ Failed to get auth cookie');
    return;
  }
  
  console.log('✅ Login successful');
  
  // Now test etiquetas API
  const res = await fetch('http://localhost:3000/api/etiquetas', {
    headers: { 'Cookie': authCookie.split(';')[0] },
  });
  
  const data = await res.json();
  console.log(`\n[${res.status}] GET /api/etiquetas`);
  console.log(`Total etiquetas: ${data.etiquetas?.length ?? 0}`);
  
  if (data.etiquetas?.length > 0) {
    console.log('\nPrimeras 5 etiquetas:');
    data.etiquetas.slice(0, 5).forEach(e => {
      console.log(`  #${e.id} | ${e.estado} | ${e.fechacreacion || 'sin fecha'}`);
    });
  } else {
    console.log('(No hay etiquetas generadas aún)');
  }
}

test().catch(console.error);
