"""Independent native binding + rational KP implementation. Python 3.11+, pyswisseph.
Run: python scripts/native_reference.py --data-dir ../../work/ephe
Downloads official Astrodienst ephemerides, preserving a reproducible fixture.
"""
import argparse, concurrent.futures, datetime, hashlib, json, pathlib, urllib.request
from fractions import Fraction
import swisseph as swe

parser=argparse.ArgumentParser()
parser.add_argument('--data-dir',default='work/ephe')
parser.add_argument('--output',default='tests/fixtures/native-reference.json')
args=parser.parse_args()
folder=pathlib.Path(args.data_dir); folder.mkdir(parents=True,exist_ok=True)
def download(name):
    p=folder/name
    if not p.exists():
        urllib.request.urlretrieve('https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/'+name,p)
    return name,hashlib.sha256(p.read_bytes()).hexdigest()
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    hashes=dict(pool.map(download,['sepl_18.se1','semo_18.se1']))
swe.set_ephe_path(str(folder.resolve())); swe.set_sid_mode(swe.SIDM_KRISHNAMURTI)
jd_tt,jd=swe.utc_to_jd(1975,10,19,0,25,0)
flags=swe.FLG_SWIEPH|swe.FLG_SIDEREAL|swe.FLG_SPEED
names=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury']
years=[7,20,6,10,7,18,16,19,17]
def lords(longitude):
    # Deliberately different algorithm: recursive Fraction proportions,
    # no precomputed integer-tick table from the application.
    x=Fraction(str(longitude%360)); width=Fraction(40,3)
    n=int(x//width); offset=x-n*width; index=n%9; out=[names[index]]
    for _ in range(2):
        for i in range(9):
            k=(index+i)%9; length=width*years[k]/120
            if offset<length:
                index=k; width=length;out.append(names[k]);break
            offset-=length
    return out
planets={}
for name,body in [('Sun',0),('Moon',1),('Mars',4),('Mercury',2),('Jupiter',5),('Venus',3),('Saturn',6),('Rahu',10),('TrueRahu',11)]:
    xx,returned=swe.calc_ut(jd,body,flags)
    assert returned&swe.FLG_SWIEPH
    planets[name]={'longitude':xx[0],'latitude':xx[1],'speed':xx[3],'lords':lords(xx[0])}
kl=(planets['Rahu']['longitude']+180)%360
planets['Ketu']={'longitude':kl,'lords':lords(kl)}
cusps,_=swe.houses_ex(jd,19.076,72.8777,b'P',swe.FLG_SIDEREAL)
moon=Fraction(str(planets['Moon']['longitude'])); width=Fraction(40,3)
fraction=(moon%width)/width
start=182910300000-float(fraction*17*Fraction('365.25')*86400000)
ref={'native_version':swe.version,'jd':jd,'data_sha256':hashes,'cusps':cusps,'cusp_lords':[lords(c) for c in cusps],'planets':planets,'dasha_start_ms':start}
# Independent recursive dasha reference at a fixed reproducible instant.
now=datetime.datetime(2026,9,13,12,tzinfo=datetime.timezone.utc).timestamp()*1000
chain=[];begin=start;duration=120*365.25*86400000;first=8
for level in range(4):
    offset=0
    for i in range(9):
        k=(first+i)%9; end=begin+duration*(offset+years[k])/120
        if begin+duration*offset/120<=now<end:
            pstart=begin+duration*offset/120;chain.append({'lord':names[k],'start':pstart,'end':end})
            begin=pstart;duration=end-pstart;first=k;break
        offset+=years[k]
ref['referenceChain']=chain
pathlib.Path(args.output).write_text(json.dumps(ref,indent=2))
print(json.dumps({'native_version':swe.version,'ascendant':cusps[0],'tenth':cusps[9],'lords':lords(cusps[9]),'chain':chain},indent=2))
