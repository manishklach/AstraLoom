import test from 'node:test';
import assert from 'node:assert/strict';
import {kp,DIVISIONS,LORDS,houseOf,dms} from '../src/kp.js';
import {resolveBirth} from '../src/time.js';
import {seedDasha,mahadashas,children,chainAt,contains,DAY} from '../src/dasha.js';
test('all 2187 sub-sub intervals tile the zodiac with exact integer boundaries',()=>{
  assert.equal(DIVISIONS.length,2187);assert.equal(DIVISIONS[0].start,0);assert.equal(DIVISIONS.at(-1).end,360*10800);
  DIVISIONS.forEach((d,i)=>{if(i)assert.equal(d.start,DIVISIONS[i-1].end);assert.ok(Number.isInteger(d.end));const p=kp((d.start+d.end)/21600);assert.equal(p.star,d.star);assert.equal(p.sub,d.sub);assert.equal(p.subsub,d.subsub);});
});
test('both sides and exact boundary of every star/sub/sub-sub transition',()=>{
  DIVISIONS.forEach((d,i)=>{for(const [x,expected] of [[d.start/10800,d],[d.start/10800+1e-7,d],[d.start/10800-1e-7,DIVISIONS[(i+2186)%2187]]]){const p=kp(x);assert.deepEqual([p.star,p.sub,p.subsub],[expected.star,expected.sub,expected.subsub]);}});
});
test('longitude wrap and rounded DMS carries',()=>{assert.deepEqual(kp(360),kp(0));assert.deepEqual(kp(-360),kp(0));assert.equal(kp(-1).sign,'Pisces');assert.equal(dms(29.99999),'Taurus 00° 00′ 00″');assert.equal(dms(359.99999),'Aries 00° 00′ 00″');assert.throws(()=>kp(NaN));});
test('house assignment wraps Aries and puts exact cusp in next house',()=>{const cusps=Array.from({length:12},(_,i)=>(350+i*30)%360);for(let i=0;i<12;i++){assert.equal(houseOf(cusps[i],cusps),i+1);assert.equal(houseOf(cusps[i]-1e-7,cusps),(i+11)%12+1);}assert.equal(houseOf(0,cusps),1);});
const base={date:'1975-10-19',hour:5,minute:55,ampm:'AM',zone:'Asia/Kolkata'};
test('sample IST, noon and midnight',()=>{assert.equal(resolveBirth(base).utc,'1975-10-19T00:25:00.000Z');assert.equal(resolveBirth({...base,hour:12,minute:0}).utc,'1975-10-18T18:30:00.000Z');assert.equal(resolveBirth({...base,hour:12,minute:0,ampm:'PM'}).utc,'1975-10-19T06:30:00.000Z');});
test('DST gap is rejected and fold requires explicit choice',()=>{const b={...base,zone:'America/New_York',date:'2024-03-10',hour:2,minute:30};assert.throws(()=>resolveBirth(b),/did not exist/);const fall={...b,date:'2024-11-03',hour:1};assert.throws(()=>resolveBirth(fall),/occurred twice/);assert.equal(resolveBirth({...fall,fold:'later'}).ms-resolveBirth({...fall,fold:'earlier'}).ms,3600000);});
test('historical offsets, non-hour DST and skipped date',()=>{assert.equal(resolveBirth({...base,date:'1943-01-01'}).offset,390);const b={...base,zone:'Australia/Lord_Howe',date:'2024-04-07',hour:1,minute:45};assert.equal(resolveBirth({...b,fold:'later'}).ms-resolveBirth({...b,fold:'earlier'}).ms,1800000);assert.throws(()=>resolveBirth({...base,zone:'Pacific/Apia',date:'2011-12-30'}),/did not exist/);});
test('invalid dates, timezones and times rejected',()=>{for(const data of [{date:'2023-02-29'},{date:'1799-01-01'},{hour:0},{hour:13},{minute:60},{second:60},{zone:'IST'},{zone:'Mars/Olympus'}])assert.throws(()=>resolveBirth({...base,...data}));});
test('full MD length at nakshatra start, and near-zero balance at end',()=>{const s=seedDasha(0,0);assert.equal(s.start,0);assert.equal(mahadashas(s)[0].end,7*365.25*DAY);const b=mahadashas(seedDasha(0,40/3-1e-7))[0];assert.ok(b.end>0&&b.end<2000);});
test('all nested periods cover parents without gaps; starts rotate with lord',()=>{for(const md of mahadashas(seedDasha(0,348.49))){let list=[md];for(let depth=0;depth<3;depth++){const next=[];for(const p of list){const c=children(p);assert.equal(c[0].lord,p.lord);assert.equal(c[0].start,p.start);assert.equal(c.at(-1).end,p.end);c.forEach((x,i)=>{assert.ok(x.end>x.start);if(i)assert.equal(x.start,c[i-1].end);});next.push(...c);}list=next;}}});
test('navigation supports earlier/later cycles and half-open period boundaries',()=>{const s=seedDasha(0,0);for(const cycle of [-2,-1,0,1,2])for(const md of mahadashas(s,cycle)){assert.equal(chainAt(s,md.start).chain[0].lord,md.lord);assert.equal(chainAt(s,md.end).chain[0].lord,LORDS[(md.index+1)%9]);assert.ok(contains(md,md.start));assert.ok(!contains(md,md.end));}assert.throws(()=>chainAt(s,NaN));});
