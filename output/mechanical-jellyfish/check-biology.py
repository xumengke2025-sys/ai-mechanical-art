from pathlib import Path
import math,json
root=Path(__file__).parent
rows=[]
for i in range(101):
 c=i/100;points=[(0,1.45)];lengths=[]
 for j in range(8):
  angle=.035+(1.42+.91*c)*((j+.5)/8)**1.5;r,y=points[-1];points.append((r+.37*math.cos(angle),y-.37*math.sin(angle)))
 bottom=points[-1][1];volume=0
 for a,b in zip(points,points[1:]):
  lengths.append(math.hypot(b[0]-a[0],b[1]-a[1]));volume+=math.pi*(a[0]+b[0])*((a[1]+b[1])/2-bottom)*(b[0]-a[0])
 rows.append({'contraction':c,'radius':points[-1][0],'depth':1.45-bottom,'volume':volume,'link_error':max(abs(x-.37) for x in lengths)})
result={'method':'Independent numerical evaluation of authored meridian; not CFD validation','contraction_seconds':3.25*.29,'recovery_seconds':3.25*.71,'cavity_volume_nonincreasing':all(b['volume']<=a['volume']+1e-10 for a,b in zip(rows,rows[1:])),'radius_nonincreasing':all(b['radius']<=a['radius'] for a,b in zip(rows,rows[1:])),'open':rows[0],'contracted':rows[-1],'maximum_link_error':max(r['link_error'] for r in rows),'species':'Chrysaora fuscescens','modeled_main_tentacles':24,'modeled_main_oral_arms':4}
(root/'qa/biological-motion-check.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result))
assert result['cavity_volume_nonincreasing'] and result['radius_nonincreasing']
