import {SIGNS} from './kp.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Traditional North Indian rasi chart: fixed house spaces, signs advance
// counterclockwise from the ascendant's sign in the upper central diamond.
const centres=[[200,97],[100,34],[35,100],[100,200],[35,300],[100,366],[200,300],[300,366],[365,300],[300,200],[365,100],[300,34]];
export function northChart(chart){
  const asc=chart.cusps[0].signIndex;
  const cells=centres.map(([x,y],i)=>{
    const sign=(asc+i)%12,planets=chart.planets.filter(p=>p.signIndex===sign);
    const compact=[1,2,4,5,7,8,10,11].includes(i);
    const labels=planets.map(p=>`${p.name.slice(0,2)}${p.retrograde?'ᴿ':''}`);
    const rows=[];const chunk=Math.max(1,Math.ceil(labels.length/3));
    for(let j=0;j<labels.length;j+=chunk)rows.push(labels.slice(j,j+chunk).join(' '));
    const labelY=y-(rows.length?12:0),font=compact?12:14;
    return `<g><title>Rasi house ${i+1}: ${SIGNS[sign]}. ${planets.map(p=>escape(p.name)).join(', ')||'No planets'}.</title><text x="${x}" y="${labelY}" class="north-sign">${sign+1}${i===0?' · Asc':''}</text>${rows.map((p,j)=>`<text x="${x}" y="${labelY+16+j*15}" class="north-planet" font-size="${font}">${p}</text>`).join('')}</g>`;
  }).join('');
  return `<div class="north-wrap"><svg class="north-chart" viewBox="-3 -3 406 406" role="img" aria-label="North Indian rasi chart. Fixed house positions; numbers denote zodiac signs. ${SIGNS[asc]} ascendant is sign ${asc+1}."><rect x="0" y="0" width="400" height="400" class="north-paper"/><path d="M0 0L400 400M400 0L0 400M200 0L400 200L200 400L0 200Z" class="north-lines"/>${cells}</svg></div><p class="hint chart-key">Numbers are signs: 1 Aries, 2 Taurus, 3 Gemini, 4 Cancer, 5 Leo, 6 Virgo, 7 Libra, 8 Scorpio, 9 Sagittarius, 10 Capricorn, 11 Aquarius, 12 Pisces. Ascendant is the upper central diamond. Placidus house occupation is listed in the table below.</p>`;
}

export function northChalitChart(chart){
  const asc=chart.cusps[0].signIndex;
  const cells=centres.map(([x,y],i)=>{
    const house=i+1,cusp=chart.cusps[i],planets=chart.planets.filter(p=>p.house===house);
    const labels=planets.map(p=>`${p.name.slice(0,2)}${p.retrograde?'ᴿ':''}`),rows=[];
    const chunk=Math.max(1,Math.ceil(labels.length/3));
    for(let j=0;j<labels.length;j+=chunk)rows.push(labels.slice(j,j+chunk).join(' '));
    const labelY=y-(rows.length?12:0),font=[1,2,4,5,7,8,10,11].includes(i)?12:14;
    return `<g><title>Bhava Chalit house ${house}: ${SIGNS[cusp.signIndex]}. ${planets.map(p=>escape(p.name)).join(', ')||'No planets'}.</title><text x="${x}" y="${labelY}" class="north-sign">H${house}${house===1?' · Asc':''}</text><text x="${x}" y="${labelY+13}" class="north-cusp">${SIGNS[cusp.signIndex]}</text>${rows.map((p,j)=>`<text x="${x}" y="${labelY+30+j*15}" class="north-planet" font-size="${font}">${p}</text>`).join('')}</g>`;
  }).join('');
  return `<div class="north-wrap chalit-wrap"><svg class="north-chart" viewBox="-3 -3 406 406" role="img" aria-label="Bhava Chalit chart. Planets are placed by their Placidus house, rather than their zodiac sign."><rect x="0" y="0" width="400" height="400" class="north-paper"/><path d="M0 0L400 400M400 0L0 400M200 0L400 200L200 400L0 200Z" class="north-lines"/>${cells}</svg></div><p class="hint chart-key">Bhava Chalit uses the same sidereal Placidus cusps as the cusp table. Planets are placed in their calculated Placidus house; the sign beneath each house is the sign occupied by that house cusp.</p>`;
}
export function houseNumbers(s){return s.allHouses??[...new Set([...s.A,...s.B,...s.C,...s.D])].sort((a,b)=>a-b);}
