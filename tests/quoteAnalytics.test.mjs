import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../lib/quoteAnalytics.js', import.meta.url), 'utf8');
const { createQuoteJourney, sanitizeQuoteProperties, validQuoteSections } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const id = '12345678-1234-4234-8234-123456789abc';
const quote = { sandType: 'Plaster', vehicleId: 'tractor', quantity: 1, address: 'Patna', name: 'Test', phone: '9876543210', delivery: 'Same day' };

test('event properties exclude customer data, arbitrary text and raw errors', () => {
  assert.deepEqual(sanitizeQuoteProperties({ language: 'hi', name: 'Private', phone: quote.phone, address: quote.address, notes: 'Private', error: 'Private', vehicle_type: 'custom', quote_attempt_id: id, invalid_fields: ['phone', 'phone', 'secret'], application: 'Private custom text' }), { language: 'hi', quote_attempt_id: id, vehicle_type: 'custom', invalid_fields: ['phone'] });
});
test('milestones deduplicate, while attempts and failures repeat for retries', () => {
  const events = [];
  const journey = createQuoteJourney((event) => events.push(event), id);
  journey.viewed({}); journey.viewed({});
  journey.stages(quote, ['tractor'], '2026-10-01', {});
  assert.deepEqual(events, ['quote_viewed']);
  journey.start({}, 'form'); journey.start({}, 'form');
  journey.stages(quote, ['tractor'], '2026-10-01', {}); journey.stages(quote, ['tractor'], '2026-10-01', {});
  journey.event('quote_submit_attempted', {}); journey.event('quote_save_failed', {}); journey.event('quote_submit_attempted', {});
  journey.saved({}); journey.saved({}); journey.stages(quote, ['tractor'], '2026-10-01', {});
  assert.deepEqual(events, ['quote_viewed', 'quote_started', 'quote_field_completed', 'quote_field_completed', 'quote_field_completed', 'quote_details_completed', 'requirement_completed', 'delivery_completed', 'contact_completed', 'quote_submit_attempted', 'quote_save_failed', 'quote_submit_attempted', 'lead_saved']);
});
test('application-card start waits for visible quote form and preserves funnel order', () => {
  const events = [];
  const journey = createQuoteJourney((event, props) => events.push([event, props.entry_point]), id);
  journey.start({}, 'application_card'); journey.stages(quote, ['tractor'], '2026-10-01', {});
  assert.equal(events.length, 0);
  journey.viewed({});
  assert.deepEqual(events.map(([event]) => event), ['quote_viewed', 'quote_started', 'quote_field_completed', 'quote_field_completed', 'quote_field_completed', 'quote_details_completed', 'requirement_completed', 'delivery_completed', 'contact_completed']);
  assert(events.every(([, entry]) => entry === 'application_card'));
});
test('sections can complete in any order; scheduled date must be valid', () => {
  assert.deepEqual(validQuoteSections({ ...quote, quantity: 0, delivery: 'Scheduled', scheduleDate: '2026-02-30' }, ['tractor'], '2026-10-01'), { requirement: false, delivery: false, contact: true });
  assert.equal(validQuoteSections({ ...quote, delivery: 'Scheduled', scheduleDate: '2026-10-02' }, ['tractor'], '2026-10-01').delivery, true);
});
test('new quote has independent milestone state and identifier', () => {
  const events = [];
  for (const attempt of [id, '22345678-1234-4234-8234-123456789abc']) {
    const journey = createQuoteJourney((event, props) => events.push([event, props.quote_attempt_id]), attempt);
    journey.viewed({}); journey.start({}); journey.saved({});
  }
  assert.equal(events.length, 6); assert.notEqual(events[0][1], events[3][1]);
});

test('application must be chosen before requirement milestone and remains visible in validation diagnostics', () => {
  assert.equal(validQuoteSections({ ...quote, sandType: '' }, ['tractor'], '2026-10-01').requirement, false);
  assert.deepEqual(sanitizeQuoteProperties({ invalid_fields: ['sandType'] }), { invalid_fields: ['sandType'] });
});

test('contact-only readiness and field interaction deduplicate without requiring optional details', () => {
  const events = [];
  const j = createQuoteJourney((event, props) => events.push([event, props]), id);
  j.viewed({}); j.start({});
  j.fieldStarted('phone', {}); j.fieldStarted('phone', {});
  const minimal = { ...quote, sandType: '', vehicleId: '', delivery: 'Scheduled', scheduleDate: '' };
  j.stages(minimal, ['tractor'], '2026-10-03', {}); j.stages(minimal, ['tractor'], '2026-10-03', {});
  assert.equal(events.filter(([e]) => e === 'quote_field_started').length, 1);
  assert.equal(events.filter(([e]) => e === 'quote_field_completed').length, 3);
  assert.equal(events.filter(([e]) => e === 'quote_details_completed').length, 1);
  assert(!events.some(([e]) => e === 'requirement_completed'));
  assert(events.some(([e]) => e === 'delivery_completed'));
  assert.deepEqual(sanitizeQuoteProperties({ field_name: 'phone', phone_location: 'header', phone: quote.phone }), { phone_location: 'header', field_name: 'phone' });
});
