import {kp,houseOf,significations,mod} from './kp.js';
import {resolveBirth} from './time.js';
import {seedDasha} from './dasha.js';
// The npm wrapper discards native return flags for these methods. Use its
// public WASM module to check errors and forbid silent Moshier/Porphyry fallback.
export function position(swe,jd,body,flags) {
  const m=swe.SweModule,p=m._malloc(48),err=m._malloc(256);
  try {
    const returned=m.ccall('swe_calc_ut','number',['number','number','number','number','number'],[jd,body,flags,p,err]);
    if(returned<0) throw new Error(m.UTF8ToString(err));
    if(!(returned&swe.SEFLG_SWIEPH)) throw new Error('Swiss ephemeris data unavailable for this date. Calculation stopped.');
    return Array.from(m.HEAPF64.slice(p/8,p/8+6));
  } finally {m._free(p);m._free(err);}
}
export function placidus(swe,jd,lat,lon) {
  const m=swe.SweModule,c=m._malloc(104),a=m._malloc(80);
  try {
    const rc=m.ccall('swe_houses_ex','number',['number','number','number','number','number','number','number'],[jd,swe.SEFLG_SIDEREAL,lat,lon,80,c,a]);
    if(rc<0) throw new Error('Placidus houses are undefined at this location and time (polar region). No alternative house system was substituted.');
    return Array.from(m.HEAPF64.slice(c/8+1,c/8+13));
  } finally {m._free(c);m._free(a);}
}
export function utcJulianDay(swe,utc) {
  const m=swe.SweModule,p=m._malloc(16),err=m._malloc(256);
  try {
    const rc=m.ccall('swe_utc_to_jd','number',Array(9).fill('number'),[utc.getUTCFullYear(),utc.getUTCMonth()+1,utc.getUTCDate(),utc.getUTCHours(),utc.getUTCMinutes(),utc.getUTCSeconds(),1,p,err]);
    if(rc<0)throw new Error(m.UTF8ToString(err));
    return {tt:m.HEAPF64[p/8],ut1:m.HEAPF64[p/8+1]};
  } finally {m._free(p);m._free(err);}
}
export function calculate(swe,input) {
  const time=resolveBirth(input),lat=Number(input.lat),lon=Number(input.lon);
  if(input.lat===''||input.lon===''||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) throw new Error('Enter valid latitude (−90 to 90) and longitude (−180 to 180).');
  if(!['mean','true'].includes(input.node)) throw new Error('Choose mean or true lunar nodes.');
  swe.set_sid_mode(swe.SE_SIDM_KRISHNAMURTI,0,0);
  const utc=new Date(time.ms),julian=utcJulianDay(swe,utc),jd=julian.ut1;
  const flags=swe.SEFLG_SWIEPH|swe.SEFLG_SPEED|swe.SEFLG_SIDEREAL;
  const longs=placidus(swe,jd,lat,lon),cusps=longs.map((l,i)=>({...kp(l),house:i+1}));
  const bodies=[['Sun',0],['Moon',1],['Mars',4],['Mercury',2],['Jupiter',5],['Venus',3],['Saturn',6],['Rahu',input.node==='true'?11:10]];
  const planets=bodies.map(([name,id])=>{const p=position(swe,jd,id,flags);return {name,...kp(p[0]),latitude:p[1],speed:p[3],retrograde:p[3]<0,house:houseOf(p[0],longs)};});
  const rahu=planets.at(-1),ketuLon=mod(rahu.longitude+180);
  planets.push({...rahu,...kp(ketuLon),name:'Ketu',latitude:-rahu.latitude,house:houseOf(ketuLon,longs)});
  const yearDays=Number(input.yearDays??365.25);
  return {input:{...input,lat,lon,yearDays},time,jd,jdTT:julian.tt,ayanamsa:swe.get_ayanamsa_ex_ut(jd,swe.SEFLG_SWIEPH),version:swe.version(),cusps,planets,significations:significations(planets,cusps),seed:seedDasha(time.ms,planets.find(p=>p.name==='Moon').longitude,yearDays)};
}

export function currentTransits(swe,natal) {
  const utc=new Date(),julian=utcJulianDay(swe,utc),jd=julian.ut1;
  swe.set_sid_mode(swe.SE_SIDM_KRISHNAMURTI,0,0);
  const flags=swe.SEFLG_SWIEPH|swe.SEFLG_SPEED|swe.SEFLG_SIDEREAL;
  const natalCusps=natal.cusps.map(c=>c.longitude);
  const bodies=[['Sun',0],['Moon',1],['Mars',4],['Mercury',2],['Jupiter',5],['Venus',3],['Saturn',6],['Rahu',natal.input.node==='true'?11:10]];
  const planets=bodies.map(([name,id])=>{const p=position(swe,jd,id,flags);return {name,...kp(p[0]),latitude:p[1],speed:p[3],retrograde:p[3]<0,natalHouse:houseOf(p[0],natalCusps)};});
  const rahu=planets.at(-1),ketuLon=mod(rahu.longitude+180);
  planets.push({...rahu,...kp(ketuLon),name:'Ketu',latitude:-rahu.latitude,natalHouse:houseOf(ketuLon,natalCusps)});
  return {ms:utc.getTime(),utc:utc.toISOString(),ayanamsa:swe.get_ayanamsa_ex_ut(jd,swe.SEFLG_SWIEPH),planets};
}
