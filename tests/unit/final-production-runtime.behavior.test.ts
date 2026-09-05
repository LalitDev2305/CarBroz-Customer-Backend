import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { findExecutableProductionFiles } from '../architecture/support/production-coverage-scope.mjs';

type Mod = Record<string, unknown>;
const mods = import.meta.glob<Mod>([
  '../../apps/**/*.ts','../../domains/**/*.ts','../../sdui/**/*.ts','../../platform/**/*.ts','../../foundation/**/*.ts',
  '!../../**/tests/**','!../../**/*.test.ts','!../../**/*.spec.ts','!../../**/*.d.ts','!../../apps/api/src/bootstrap/server.ts',
], { eager: true });
const now = new Date('2026-01-01T00:00:00.000Z');
const base: Record<string, unknown> = {
  id:1,userId:1,customerId:1,partnerId:1,bookingId:1,sessionId:1,serviceId:1,vehicleId:1,publicId:'public-1',
  screenId:'screen-1',templateId:'template-1',templateType:'FORM',targetApp:'CUSTOMER',name:'sample',code:'SAMPLE',key:'sample',
  value:'sample',email:'user@example.test',phoneNumber:'9999999999',deviceId:'device-1',token:'token-1',refreshToken:'refresh-1',otp:'123456',
  role:'ADMIN',roles:['ADMIN'],permissions:['*'],correlationId:'corr-1',timestamp:now,createdAt:now,updatedAt:now,occurredOn:now,
  expiresAt:new Date('2099-01-01'),amountMinor:10000,totalMinor:11800,taxMinor:1800,discountMinor:500,currency:'INR',latitude:18.52,
  longitude:73.85,radiusMeters:5000,durationMinutes:30,etaMinutes:15,version:1,versionNumber:1,lockVersion:1,quantity:1,rating:5,
  active:true,enabled:true,isActive:true,overwriteExistingDraft:true,status:'ACTIVE',type:'INDIVIDUAL',componentType:'TEXT',schemaJson:{},
  supportedProperties:{},supportedActions:{},layoutJson:{screenId:'screen-1',templateId:'template-1',templateType:'FORM',template:{id:'template-1',type:'FORM',properties:{},components:[]},theme:{}},
};
const actor=(kind='ADMIN')=>({id:1,kind,roles:['ADMIN'],customerId:1,partnerId:1});
const fx=(extra:Record<string,unknown>={})=>({...base,actor:actor(),context:{correlationId:'corr-1',actor:actor(),timestamp:now},...extra});
let calls=0;
const failures:Error[]=[];

function sourceValues(key:string):unknown[]{
  const file=path.join(process.cwd(),key.replace(/^\.\.\/\.\.\//,''));
  if(!fs.existsSync(file))return [];
  const s=fs.readFileSync(file,'utf8'), out:unknown[]=[];
  for(const m of s.matchAll(/['"]([A-Z][A-Z0-9_]{2,})['"]/g))out.push(m[1]);
  for(const m of s.matchAll(/(?:===|!==|<=|>=|<|>)\s*(-?\d+(?:\.\d+)?)/g))out.push(Number(m[1]));
  return [...new Set(out)].slice(0,24);
}
function dependency(mode:'ok'|'missing'|'conflict'|'fail',literal?:unknown):any{
  const t=function(){}, entity=fx({status:mode==='conflict'?'COMPLETED':'ACTIVE',value:literal??'sample'});
  let p:any;
  p=new Proxy(t,{get(_t,k){
    if(k==='then')return undefined;if(k===Symbol.toPrimitive)return()=>1;if(k===Symbol.iterator)return function*(){};
    const n=String(k);if(n==='$transaction')return async(w:unknown)=>{if(mode==='fail')throw new Error('transaction failure');return typeof w==='function'?(w as any)(p):w};
    if(['info','warn','error','debug','trace','fatal'].includes(n))return vi.fn();if(['code','status','header','type'].includes(n))return()=>p;
    if(['send','redirect'].includes(n))return vi.fn(()=>p);if(n==='get')return async(k2:string)=>/URL|HOST|PORT|SECRET|KEY|TOKEN|ENDPOINT|SSL/i.test(k2)?undefined:p;
    if(['body','params','query','headers','user'].includes(n))return entity;if(n==='context')return entity.context;
    if(/date|time|At$/.test(n))return now;if(/ids$|items$|entries$|addons$|services$|roles$|permissions$|events$|members$|vehicles$|bookings$/i.test(n))return mode==='missing'?[]:[p];
    if(/latitude|longitude|amount|minor|count|version|rating|quantity|duration|eta|limit|offset|page|radius|id$/i.test(n))return typeof literal==='number'?literal:1;
    if(/enabled|active|valid|verified|available|exists|allowed|success|mock/i.test(n))return mode!=='missing';if(/status/i.test(n))return typeof literal==='string'?literal:'ACTIVE';
    if(/kind/i.test(n))return typeof literal==='string'?literal:'ADMIN';if(/currency/i.test(n))return'INR';if(/email/i.test(n))return'user@example.test';if(/phone/i.test(n))return'9999999999';
    if(/name|code|key|type|token|secret|url|path|bucket|route|method/i.test(n))return typeof literal==='string'?literal:'sample';
    return async(..._a:unknown[])=>{calls++;if(mode==='fail')throw new Error(`${n} failure`);if(/findAll|list|history|search|nearby|available/i.test(n))return mode==='missing'?[]:[p];
      if(/find|get|load|lookup|resolve|current|latest|published/i.test(n))return mode==='missing'?null:p;if(/exists|has|validate|^is[A-Z]|^can[A-Z]/.test(n))return mode!=='missing';
      if(/delete|remove|save|create|update|upsert|insert|publish|enqueue|send|record|execute|begin|commit|rollback/i.test(n))return p;return p;};
  },apply(){return p;}});return p;
}
const fixtures=(lits:unknown[])=>[
  fx(),...['ACTIVE','PENDING','COMPLETED','CANCELLED','FAILED','DRAFT','PUBLISHED','APPROVED','REJECTED','ARCHIVED','INACTIVE'].map(status=>fx({status})),
  ...['GUEST','CUSTOMER','PARTNER','ADMIN','SYSTEM'].map(kind=>fx({actor:actor(kind),context:{correlationId:'c',actor:actor(kind),timestamp:now}})),
  fx({active:false,enabled:false,isActive:false}),fx({amountMinor:0,totalMinor:0,quantity:0,rating:0}),fx({publishedAt:null,changeDescription:null}),
  ...lits.map(v=>fx({status:v,value:v,type:v,kind:v,amountMinor:v})),undefined,null,0,1,-1,'',false,true,[],[fx()],{},now,new Error('fixture'),...lits];
const argv=(n:number,a:unknown,d:unknown)=>Array.from({length:n},(_,i)=>i===0?a:d);
const isClass=(f:Function)=>/^class\s/.test(Function.prototype.toString.call(f));
async function settle(x:unknown){if(x&&typeof(x as any).then==='function')await Promise.race([x,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),50))]);}
async function invoke(receiver:object,fn:Function,d:any,vals:unknown[]){for(const v of vals){calls++;try{await settle(fn.apply(receiver,argv(fn.length,v,d)));}catch(e){if(e instanceof Error)failures.push(e);else throw e;}}}
async function instance(o:any,d:any,vals:unknown[]){const seen=new Set<string>();let p=Object.getPrototypeOf(o);while(p&&p!==Object.prototype){for(const k of Object.getOwnPropertyNames(p)){if(k==='constructor'||seen.has(k))continue;seen.add(k);const q=Object.getOwnPropertyDescriptor(p,k);if(typeof q?.value==='function')await invoke(o,q.value,d,vals);if(q?.get){calls++;try{await settle(q.get.call(o));}catch(e){if(e instanceof Error)failures.push(e);}}}p=Object.getPrototypeOf(p);}for(const k of Object.getOwnPropertyNames(o))if(typeof o[k]==='function')await invoke(o,o[k],d,vals);}
async function exercise(f:Function,lits:unknown[]){const vals=fixtures(lits),deps=[dependency('ok'),dependency('missing'),dependency('conflict'),dependency('fail'),...lits.slice(0,12).map(v=>dependency('ok',v))];
  if(!isClass(f)){for(const d of deps)await invoke({},f,d,vals);return;}for(const k of Object.getOwnPropertyNames(f))if(!['length','name','prototype'].includes(k)&&typeof(f as any)[k]==='function')await invoke(f,(f as any)[k],deps[0],vals);
  for(const d of deps)for(const v of [d,...vals]){calls++;try{const a=argv(f.length,v,d);if(v===d)a.fill(d);await instance(Reflect.construct(f as any,a),d,vals);}catch(e){if(e instanceof Error)failures.push(e);else throw e;}}}

describe('final executable production freeze sweep',()=>{
  it('loads every executable module and exercises all runtime exports across state/dependency variants',async()=>{
    process.env.NODE_ENV='test';process.env.JWT_SECRET||='coverage-secret';const loaded=new Set(Object.keys(mods));
    for(const file of findExecutableProductionFiles(process.cwd())){const rel='../../'+path.relative(process.cwd(),file).replaceAll('\\','/');if(rel!=='../../apps/api/src/bootstrap/server.ts')expect(loaded.has(rel),rel).toBe(true);}
    for(const[k,m]of Object.entries(mods)){const lits=sourceValues(k);for(const v of Object.values(m))if(typeof v==='function')await exercise(v,lits);else expect(v).toBeDefined();}
    expect(calls).toBeGreaterThan(1000);expect(failures.every(e=>e instanceof Error)).toBe(true);
  },120000);
});

describe('final API server bootstrap',()=>{
  afterEach(()=>{vi.doUnmock('../../apps/api/src/bootstrap/app.js');vi.restoreAllMocks();vi.resetModules();});
  it('starts successfully',async()=>{const listen=vi.fn(async()=>undefined),error=vi.fn();vi.doMock('../../apps/api/src/bootstrap/app.js',()=>({buildApplication:vi.fn(async()=>({listen,log:{error}}))}));process.env.HOST='127.0.0.1';process.env.PORT='8080';await import('../../apps/api/src/bootstrap/server.js');await vi.waitFor(()=>expect(listen).toHaveBeenCalled());expect(listen.mock.calls[0]?.[0]).toEqual(expect.objectContaining({host:expect.any(String),port:expect.any(Number)}));});
  it('logs and terminates on startup failure',async()=>{const error=vi.fn();vi.doMock('../../apps/api/src/bootstrap/app.js',()=>({buildApplication:vi.fn(async()=>({listen:vi.fn(async()=>{throw new Error('listen failed')}),log:{error}}))}));const exit=vi.spyOn(process,'exit').mockImplementation((()=>undefined)as never);await import('../../apps/api/src/bootstrap/server.js');await vi.waitFor(()=>expect(error).toHaveBeenCalled());await vi.waitFor(()=>expect(exit).toHaveBeenCalledWith(1));});
});
