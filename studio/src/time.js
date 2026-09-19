import {DateTime,IANAZone} from 'luxon';
export {DateTime};
export function resolveBirth({date,hour,minute,second=0,ampm,zone,fold='reject'}) {
  if((zone!=='UTC'&&!zone?.includes('/'))||!IANAZone.isValidZone(zone)) throw new Error('Enter a valid IANA timezone, such as Asia/Kolkata. Ambiguous abbreviations are not accepted.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Enter a complete birth date.');
  if(!Number.isInteger(+hour)||+hour<1||+hour>12||!Number.isInteger(+minute)||+minute<0||+minute>59||!Number.isInteger(+second)||+second<0||+second>59||!['AM','PM'].includes(ampm)) throw new Error('Enter a valid 12-hour time with AM or PM.');
  const [year,month,day]=date.split('-').map(Number), h=+hour%12+(ampm==='PM'?12:0);
  if(year<1800||year>2399) throw new Error('Supported birth dates are 1800–2399.');
  const dt=DateTime.fromObject({year,month,day,hour:h,minute:+minute,second:+second},{zone});
  if(!dt.isValid) throw new Error('That calendar date is not valid.');
  if(dt.hour!==h||dt.minute!==+minute||dt.second!==+second||dt.day!==day) throw new Error('This local time did not exist because the clock moved forward. Enter a valid time.');
  const choices=dt.getPossibleOffsets().sort((a,b)=>a.toMillis()-b.toMillis());
  if(choices.length>1&&!['earlier','later'].includes(fold)) throw new Error('This time occurred twice. Choose the first or second occurrence under DST handling.');
  const selected=choices.length>1?choices[fold==='later'?1:0]:dt;
  return {ms:selected.toMillis(),utc:selected.toUTC().toISO(),local:selected.toISO(),offset:selected.offset,dst:selected.isInDST,ambiguous:choices.length>1,zone};
}
export function formatTime(ms,zone='UTC') {return DateTime.fromMillis(Math.round(ms),{zone}).toFormat('dd LLL yyyy, HH:mm:ss ZZ');}
