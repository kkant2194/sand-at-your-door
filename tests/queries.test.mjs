import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../app/api/queries/route.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace(/export /g, '');
function harness() {
  let saved;
  const client = { from(table) {
    const chain = { select() { return chain; }, lte() { return chain; }, order() { return chain; }, limit() { return chain; }, eq() { return chain; },
      maybeSingle: async () => ({ data: table === 'pricing' ? { price_date: '2026-10-03', rates: { vehicles: [{ id: 'tractor', name: 'Tractor', price: 4000 }] } } : null, error: null }),
      insert(row) { saved = row; return chain; }, single: async () => ({ data: { id: 'saved-reference' }, error: null }) };
    return chain;
  } };
  const POST = new Function('createClient', 'NextResponse', 'getSameDaySurcharge', 'parseSameDaySurcharge', 'process', source + '\nreturn POST;')(() => client, { json: (body, options) => ({ body, status: options?.status || 200 }) }, () => 500, Number, { env: { NEXT_PUBLIC_SUPABASE_URL: 'test', SUPABASE_SERVICE_ROLE_KEY: 'test' } });
  return { send: body => POST(new Request('http://localhost/api/queries', { method: 'POST', body: JSON.stringify(body) })), saved: () => saved };
}
const contact = { name: 'Test Buyer', phone: '9876543210', address: 'Patna' };
test('contact-only enquiry saves without selecting application or vehicle', async () => {
  const h = harness(); const result = await h.send(contact);
  assert.equal(result.status, 200); assert.equal(result.body.priced, false);
  assert.equal(h.saved().unit, 'unspecified'); assert.equal(h.saved().total, 0); assert.equal(h.saved().price_date, null);
});
test('optional selected vehicle retains authoritative server pricing', async () => {
  const h = harness(); const result = await h.send({ ...contact, vehicleId: 'tractor', quantity: 2, total: 1 });
  assert.equal(result.status, 200); assert.equal(result.body.priced, true); assert.equal(result.body.total, 8000);
});
test('required contact and supplied optional values remain validated', async () => {
  for (const body of [{ ...contact, phone: '' }, { ...contact, address: '' }, { ...contact, sandType: 'invalid' }, { ...contact, quantity: 0 }]) {
    assert.equal((await harness().send(body)).status, 400);
  }
});
