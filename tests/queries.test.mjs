import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../app/api/queries/route.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace(/export /g, '');
const { parseEstimatedCapacity } = await import('data:text/javascript;base64,' + Buffer.from(readFileSync(new URL('../lib/vehicleCapacity.js', import.meta.url), 'utf8')).toString('base64'));
function harness(capacity) {
  let saved;
  const client = { from(table) {
    const chain = { select() { return chain; }, lte() { return chain; }, order() { return chain; }, limit() { return chain; }, eq() { return chain; },
      maybeSingle: async () => ({ data: table === 'pricing' ? { price_date: '2026-10-03', rates: { vehicles: [{ id: 'tractor', name: 'Tractor', price: 4000, estimatedCapacityCft: capacity }] } } : null, error: null }),
      insert(row) { saved = row; return chain; }, single: async () => ({ data: { id: '12345678-abcd-4234-8234-123456789abc' }, error: null }) };
    return chain;
  } };
  const POST = new Function('createClient', 'NextResponse', 'getSameDaySurcharge', 'parseSameDaySurcharge', 'parseEstimatedCapacity', 'process', source + '\nreturn POST;')(() => client, { json: (body, options) => ({ body, status: options?.status || 200 }) }, () => 500, Number, parseEstimatedCapacity, { env: { NEXT_PUBLIC_SUPABASE_URL: 'test', SUPABASE_SERVICE_ROLE_KEY: 'test' } });
  return { send: body => POST(new Request('http://localhost/api/queries', { method: 'POST', body: JSON.stringify(body) })), saved: () => saved };
}
const contact = { name: 'Test Buyer', phone: '9876543210', address: 'Patna' };
test('contact-only enquiry saves without selecting application or vehicle', async () => {
  const h = harness(); const result = await h.send({ ...contact, quantity: 0 });
  assert.equal(result.status, 200); assert.equal(result.body.priced, false);
  assert.match(result.body.reference, /^[A-F0-9]{10}$/);
  assert.equal(h.saved().unit, 'unspecified'); assert.equal(h.saved().total, 0); assert.equal(h.saved().price_date, null);
});
test('optional selected vehicle retains authoritative server pricing', async () => {
  const h = harness(); const result = await h.send({ ...contact, vehicleId: 'tractor', quantity: 2, total: 1 });
  assert.equal(result.status, 200); assert.equal(result.body.priced, true); assert.equal(result.body.total, 8000);
});
test('required contact and supplied optional values remain validated', async () => {
  for (const body of [{ ...contact, phone: '' }, { ...contact, address: '' }, { ...contact, sandType: 'invalid' }, { ...contact, quantity: 0, vehicleId: 'tractor' }, { ...contact, quantity: -1 }]) {
    assert.equal((await harness().send(body)).status, 400);
  }
});

test('capacity snapshot comes from saved pricing, not the buyer payload', async () => {
  const h = harness(100);
  const result = await h.send({ ...contact, vehicleId: 'tractor', quantity: 2, estimatedCapacityCft: 999 });
  assert.equal(result.body.estimatedCapacityCft, 100);
  assert.equal(h.saved().unit_label, 'Tractor · Approx. 100 cft/load');
  assert.equal(result.body.total, 8000);
});
test('legacy pricing without capacity remains usable', async () => {
  const h = harness();
  const result = await h.send({ ...contact, vehicleId: 'tractor', quantity: 1 });
  assert.equal(result.status, 200);
  assert.equal(result.body.estimatedCapacityCft, null);
  assert.equal(h.saved().unit_label, 'Tractor');
});
test('capacity accepts positive decimals and rejects invalid operating estimates', () => {
  assert.equal(parseEstimatedCapacity('100.5'), 100.5);
  for (const value of [undefined, null, '', ' ', 0, -1, 'unknown', Infinity, true, []]) {
    assert.equal(parseEstimatedCapacity(value), null);
  }
});
