// Full E2E test: generate tags, activate one, check QR page
async function e2eTest() {
  // === LOGIN ===
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@qbar.com', password: 'admin123' }),
  });
  const cookies = loginRes.headers.getSetCookie();
  const authCookie = cookies.find(c => c.startsWith('auth_token='))?.split(';')[0];
  if (!authCookie) { console.log('❌ Login failed'); return; }
  console.log('✅ Step 1: Login OK\n');

  const headers = { 'Content-Type': 'application/json', 'Cookie': authCookie };

  // === GENERATE 10 TAGS (1-10) ===
  const genRes = await fetch('http://localhost:3000/api/etiquetas/generar', {
    method: 'POST',
    headers,
    body: JSON.stringify({ startId: 1, endId: 10 }),
  });
  const genData = await genRes.json();
  console.log(`${genRes.ok ? '✅' : '❌'} Step 2: Generate 10 tags => ${JSON.stringify(genData)}\n`);

  // === LIST TAGS ===
  const listRes = await fetch('http://localhost:3000/api/etiquetas', { headers: { 'Cookie': authCookie } });
  const listData = await listRes.json();
  console.log(`✅ Step 3: List tags => ${listData.etiquetas?.length} etiquetas found`);
  listData.etiquetas?.forEach(e => {
    console.log(`   #${e.id} | ${e.estado} | ${e.fechacreacion?.substring(0, 10)}`);
  });
  console.log('');

  // === GET TIPOS EQUIPAJE ===
  const tiposRes = await fetch('http://localhost:3000/api/equipajes', { headers: { 'Cookie': authCookie } });
  const tiposData = await tiposRes.json();
  const firstTipo = tiposData.tipos?.[0];
  console.log(`✅ Step 4: Got ${tiposData.tipos?.length} tipos equipaje (using: ${firstTipo?.nombre})\n`);

  // === ACTIVATE TAG #5 ===
  const activateRes = await fetch('http://localhost:3000/api/etiquetas/activar', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      etiquetaId: '5',
      reserva: 'ABC789',
      vueloOrigen: 'BOG',
      vueloDestino: 'MIA',
      tipoEquipajeId: firstTipo?.id,
      fechaInicio: '2026-03-18',
      fechaFin: '2026-03-25',
      precioCobrado: 75
    }),
  });
  const activateData = await activateRes.json();
  console.log(`${activateRes.ok ? '✅' : '❌'} Step 5: Activate tag #5 => ${JSON.stringify(activateData)}\n`);

  // === VIEW TAG #5 QR PAGE (public endpoint) ===
  const qrRes = await fetch('http://localhost:3000/etiqueta/5');
  console.log(`${qrRes.ok ? '✅' : '❌'} Step 6: QR page /etiqueta/5 => HTTP ${qrRes.status}`);
  
  if (qrRes.ok) {
    const html = await qrRes.text();
    // Check if it contains the activation data
    const hasReserva = html.includes('ABC789');
    const hasOrigen = html.includes('BOG');
    const hasDestino = html.includes('MIA');
    console.log(`   Contains reserva ABC789: ${hasReserva}`);
    console.log(`   Contains origen BOG: ${hasOrigen}`);
    console.log(`   Contains destino MIA: ${hasDestino}`);
  }

  console.log('\n🎉 E2E Test completed!');
}

e2eTest().catch(console.error);
