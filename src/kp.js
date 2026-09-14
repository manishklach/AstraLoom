export const LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const YEARS = [7,20,6,10,7,18,16,19,17];
export const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export const OWNERS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
export const STARS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
export const mod = (n,m=360) => ((n%m)+m)%m;
// One tick = 1/3 arcsecond. All nakshatra, sub and sub-sub boundaries
// are exact integers: 144000, 1200*years, 10*years*years ticks.
export const DIVISIONS = [];
for (let n=0;n<27;n++) {
  let subStart=n*144000;
  for(let i=0;i<9;i++) {
    const s=(n+i)%9; let start=subStart;
    for(let j=0;j<9;j++) {
      const ss=(s+j)%9, end=start+10*YEARS[s]*YEARS[ss];
      DIVISIONS.push({start,end,n,star:LORDS[n%9],sub:LORDS[s],subsub:LORDS[ss]});
      start=end;
    }
    subStart+=1200*YEARS[s];
  }
}
export function kp(longitude) {
  if(!Number.isFinite(longitude)) throw new Error('Longitude must be finite.');
  const lon=mod(longitude), raw=lon*10800;
  // Correct floating representation of mathematically exact tick boundaries only.
  const t=Math.abs(raw-Math.round(raw))<1e-8?Math.round(raw):raw;
  let lo=0,hi=DIVISIONS.length;
  while(lo<hi) {const mid=(lo+hi)>>1;if(DIVISIONS[mid].end<=t)lo=mid+1;else hi=mid;}
  const d=DIVISIONS[lo%DIVISIONS.length], signIndex=Math.floor(lon/30);
  return {longitude:lon,sign:SIGNS[signIndex],signIndex,signLord:OWNERS[signIndex],nakshatra:STARS[d.n],nakshatraIndex:d.n,star:d.star,sub:d.sub,subsub:d.subsub,boundaryArcsec:Math.min(Math.abs(t-d.start),Math.abs(d.end-t))/3};
}
export function houseOf(lon,cusps) {
  for(let i=0;i<12;i++) if(mod(lon-cusps[i])<mod(cusps[(i+1)%12]-cusps[i])) return i+1;
  throw new Error('Cannot assign house: invalid cusps.');
}
export function significations(planets,cusps) {
  const owned=name=>cusps.filter(c=>c.signLord===name).map(c=>c.house);
  const basic=p=>[...new Set([p.house,...owned(p.name)])].sort((a,b)=>a-b);
  const map=Object.fromEntries(planets.map(p=>[p.name,p]));
  const isNode=p=>p.name==='Rahu'||p.name==='Ketu';
  const planetsWithAspects=planets.filter(p=>!isNode(p));
  const vedicAspects={Sun:[7],Moon:[7],Mercury:[7],Venus:[7],Mars:[4,7,8],Jupiter:[5,7,9],Saturn:[3,7,10]};
  // A conjunction here means planets sharing a sidereal sign. KP practitioners
  // commonly apply this sign-level node agency; it is intentionally shown as
  // a source rather than silently blended into the four-fold table.
  const axisConjunctions=planets.filter(isNode).flatMap(node=>
    planetsWithAspects.filter(p=>p.signIndex===node.signIndex).map(p=>({node:node.name,planet:p.name,houses:basic(p)}))
  );
  const unique=values=>[...new Set(values.flat(Infinity))].sort((a,b)=>a-b);
  const rows=planets.map(p=>{
    const star=map[p.star],sub=map[p.sub];
    const fourFold={A:[star.house],B:[p.house],C:owned(star.name),D:owned(p.name)};
    if(!isNode(p)) return {name:p.name,star:p.star,sub:p.sub,...fourFold,allHouses:unique(Object.values(fourFold)),planet:basic(p),starHouses:basic(star),subHouses:basic(sub),nodeAgency:null};
    const aspectAgencies=planetsWithAspects
      .filter(candidate=>vedicAspects[candidate.name].some(aspect=>((candidate.signIndex+aspect-1)%12)===p.signIndex))
      .map(candidate=>({planet:candidate.name,aspects:vedicAspects[candidate.name].filter(aspect=>((candidate.signIndex+aspect-1)%12)===p.signIndex),houses:basic(candidate)}));
    const nodeAgency={
      starLord:{lord:star.name,houses:basic(star)},
      signLord:{lord:p.signLord,houses:basic(map[p.signLord])},
      aspects:aspectAgencies,
      axisConjunctions
    };
    // A node's usable agency is its placement, sign lord, received aspects,
    // and node-axis conjunctions. Its nakshatra lord remains visible as a
    // relationship, but is not folded into this carrier set.
    const carrierHouses=unique([[p.house],nodeAgency.signLord.houses,aspectAgencies.map(a=>a.houses),axisConjunctions.map(a=>a.houses)]);
    return {name:p.name,star:p.star,sub:p.sub,...fourFold,allHouses:carrierHouses,carrierHouses,planet:basic(p),starHouses:basic(star),subHouses:basic(sub),nodeAgency};
  });
  const byName=Object.fromEntries(rows.map(p=>[p.name,p]));
  return rows.map(p=>{
    if(p.nodeAgency) return p;
    const starNode=byName[p.star],subNode=byName[p.sub];
    const starHouses=starNode?.carrierHouses??p.starHouses;
    const subHouses=subNode?.carrierHouses??p.subHouses;
    return {
      ...p,
      starHouses,
      subHouses,
      allHouses:unique([p.allHouses,starNode?.carrierHouses??[],subNode?.carrierHouses??[]])
    };
  });
}
export function dms(lon) {
  const sec=Math.round(mod(lon)*3600), sign=Math.floor(sec/108000)%12, within=sec%108000;
  return `${SIGNS[sign]} ${String(Math.floor(within/3600)).padStart(2,'0')}° ${String(Math.floor(within%3600/60)).padStart(2,'0')}′ ${String(within%60).padStart(2,'0')}″`;
}
