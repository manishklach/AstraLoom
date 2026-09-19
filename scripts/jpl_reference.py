"""Independent astronomy cross-check using NASA/JPL Horizons geocentric apparent
ecliptic-of-date longitudes (quantity 31) at the sample UTC instant.
Raw responses and input URLs are retained; no app result is sent to NASA.
"""
import argparse,concurrent.futures,json,pathlib,re,urllib.request,urllib.parse
import swisseph as swe
parser=argparse.ArgumentParser();parser.add_argument('--data-dir',default='work/ephe');args=parser.parse_args()
swe.set_ephe_path(str(pathlib.Path(args.data_dir).resolve()))
jd=swe.julday(1975,10,19,25/60)
def check(item):
    swe.set_ephe_path(str(pathlib.Path(args.data_dir).resolve()))
    name,jplid,sweid=item
    params={'format':'text','COMMAND':str(jplid),'EPHEM_TYPE':'OBSERVER','CENTER':'500@399','TLIST':str(jd),'QUANTITIES':'31','CSV_FORMAT':'YES','EXTRA_PREC':'YES'}
    url='https://ssd.jpl.nasa.gov/api/horizons.api?'+urllib.parse.urlencode({k:"'"+v+"'" if k!='format' else v for k,v in params.items()})
    saved=pathlib.Path(f'tests/fixtures/jpl-{name.lower()}.txt')
    if saved.exists() and '$$SOE' in saved.read_text(encoding='utf8'):
        raw=saved.read_text(encoding='utf8')
    else:
        raw=urllib.request.urlopen(url,timeout=60).read().decode()
        saved.write_text(raw,encoding='utf8')
    line=raw.split('$$SOE')[1].split('$$EOE')[0].strip()
    fields=[x.strip() for x in line.split(',')]
    # CSV: calendar date, solar presence, lunar presence, ObsEcLon, ObsEcLat.
    lon=float(fields[3]);lat=float(fields[4])
    _,jd_ut1=swe.utc_to_jd(1975,10,19,0,25,0)
    xx,returned=swe.calc_ut(jd_ut1,sweid,swe.FLG_SWIEPH)
    assert returned&swe.FLG_SWIEPH
    app=json.loads(pathlib.Path('tests/fixtures/sample-wasm.json').read_text())
    app_lon=(next(p['longitude'] for p in app['planets'] if p['name']==name)+app['ayanamsa'])%360
    return {'name':name,'url':url,'jpl_longitude':lon,'jpl_latitude':lat,'swiss_de441_tropical_longitude':xx[0],'delta_arcsec':((xx[0]-lon+180)%360-180)*3600,'app_tropical_longitude':app_lon,'app_delta_arcsec':((app_lon-lon+180)%360-180)*3600}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(check,[('Sun',10,0),('Moon',301,1),('Mercury',199,2),('Venus',299,3),('Mars',499,4),('Jupiter',599,5),('Saturn',699,6)]))
pathlib.Path('tests/fixtures/jpl-reference.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
