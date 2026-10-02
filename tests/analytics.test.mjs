import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const core = readFileSync(new URL('../lib/quoteAnalytics.js', import.meta.url), 'utf8');
const { QUOTE_EVENTS, sanitizeQuoteProperties } = await import(`data:text/javascript;base64,${Buffer.from(core).toString('base64')}`);
const source = readFileSync(new URL('../lib/analytics.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace(/export /g, '').replace('import("mixpanel-browser")', 'loadSDK()');
function harness({ token = 'test-token', hostname = 'example.com', pathname = '/', enabledLocal = 'false', region = 'US', broken = false } = {}) {
 const calls=[];
 const sdk = { init:(token,config)=>calls.push(['init',token,config]), track:(event,props)=>calls.push(['track',event,props]) };
 const process={env:{NEXT_PUBLIC_MIXPANEL_TOKEN:token,NEXT_PUBLIC_ENABLE_MIXPANEL_ON_LOCALHOST:enabledLocal,NEXT_PUBLIC_MIXPANEL_REGION:region}};
 const window={location:{hostname,pathname},innerWidth:390};
 const api=new Function('QUOTE_EVENTS','sanitizeQuoteProperties','loadSDK','window','process',source+'\nreturn {trackQuoteEvent,initAnalytics};')(QUOTE_EVENTS,sanitizeQuoteProperties,()=>broken ? Promise.reject(Error('blocked')) : Promise.resolve({default:sdk}),window,process);
 return {api,calls};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('tracking is disabled without token, on admin, and localhost by default',async()=>{
 for(const config of [{token:''},{hostname:'localhost'},{pathname:'/admin'},{pathname:'/admin/settings'}]) {
  const {api,calls}=harness(config);api.trackQuoteEvent('quote_started',{});await settle();assert.equal(calls.length,0);
 }
});
test('regional SDK setup disables automatic collection and sanitizes events',async()=>{
 const {api,calls}=harness({hostname:'localhost',enabledLocal:'true',region:'IN'});
 api.trackQuoteEvent('quote_started',{language:'hi',phone:'9876543210',notes:'private'});await settle();
 assert.equal(calls[0][2].api_host,'https://api-in.mixpanel.com');
 assert.equal(calls[0][2].ip,true);
 assert.equal(calls[0][2].autocapture,false);assert.equal(calls[0][2].record_sessions_percent,0);
 assert.deepEqual(calls[1],['track','quote_started',{language:'hi',device_type:'mobile'}]);
 api.trackQuoteEvent('unapproved_event',{});await settle();assert.equal(calls.length,2);
});
test('SDK loading failure is swallowed and does not block the application',async()=>{
 const {api,calls}=harness({broken:true});assert.doesNotThrow(()=>api.trackQuoteEvent('lead_saved',{}));await settle();assert.equal(calls.length,0);
});
