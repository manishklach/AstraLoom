import {kp,LORDS,YEARS} from './kp.js';
export const DAY=86400000;
export function seedDasha(birthMs,moonLongitude,yearDays=365.25) {
  if(![365.25,365.25636,360].includes(yearDays)) throw new Error('Unsupported dasha year.');
  const m=kp(moonLongitude), index=LORDS.indexOf(m.star), duration=YEARS[index]*yearDays*DAY;
  const fraction=(m.longitude*10800-m.nakshatraIndex*144000)/144000;
  return {start:birthMs-fraction*duration,index,yearDays};
}
export function mahadashas(seed,cycle=0) {
  let start=seed.start+cycle*120*seed.yearDays*DAY;
  return Array.from({length:9},(_,i)=>{const index=(seed.index+i)%9,end=start+YEARS[index]*seed.yearDays*DAY,p={lord:LORDS[index],index,start,end,level:0};start=end;return p;});
}
export function children(parent) {
  let cumulative=0;
  return Array.from({length:9},(_,i)=>{
    const index=(parent.index+i)%9,start=parent.start+(parent.end-parent.start)*cumulative/120;
    cumulative+=YEARS[index];
    return {lord:LORDS[index],index,start,end:i===8?parent.end:parent.start+(parent.end-parent.start)*cumulative/120,level:parent.level+1};
  });
}
export const contains=(p,ms)=>ms>=p.start&&ms<p.end;
export function chainAt(seed,ms) {
  if(!Number.isFinite(ms)) throw new Error('Select a valid date and time.');
  const cycle=Math.floor((ms-seed.start)/(120*seed.yearDays*DAY));
  let list=mahadashas(seed,cycle),chain=[];
  for(let level=0;level<4;level++){const p=list.find(p=>contains(p,ms));if(!p)throw new Error('Date outside dasha range.');chain.push(p);list=children(p);}
  return {cycle,chain};
}
