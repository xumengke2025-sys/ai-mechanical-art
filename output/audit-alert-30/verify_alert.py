"""Check the rendered scene's sampled business handoffs; no AV quality claim."""
from pathlib import Path
import json,math
R=Path(__file__).parent
data=json.loads((R/'qa/motion-audit.json').read_text(encoding='utf-8'))
states=data['states'];fail=[]
for s in states:
 t=s['t'];m=s['mechanism'];a=m['alert']
 if a['qualifies']!=(a['countExample']>=a['threshold']):fail.append([t,'threshold predicate'])
 if a['alarm']>0 and (t<19.96 or abs(m['panels'][4])>1e-7):fail.append([t,'alarm before readable count'])
 if a['dispatch']>0 and a['release']<1-1e-8:fail.append([t,'dispatch before elevator raised'])
 if a['accepted']>0 and a['dispatch']<1-1e-8:fail.append([t,'accepted before ball arrival'])
 if m['stampOpacity']>0 and a['accepted']<1-1e-8:fail.append([t,'stamp before acceptance'])
 if m['filing']['branch']!='B02' or m['filing']['manager']!='M04' or m['caseId']!='A017':fail.append([t,'identity lost'])
dist=lambda a,b:math.dist(a,b)
joins=[]
for t in [18.18,18.95,19.58]:
 i=min(range(len(states)),key=lambda i:abs(states[i]['t']-t))
 joins.append({'t':t,'nearby_step_distance':dist(states[max(0,i-1)]['mechanism']['filing']['position'],states[min(len(states)-1,i+1)]['mechanism']['filing']['position'])})
result={'samples':len(states),'conditions':['count>=threshold','count visible before alarm','raised before dispatch','arrival before acceptance','acceptance before stamp','stable case ownership'],
 'failures':fail,'filing_junction_samples':joins,'event_order_seconds':{'client':18.05,'manager':18.82,'branch':19.50,'count_visible':19.84,'alarm_begin':19.96,'ball_raised':20.62,'ball_arrived':22.65,'accepted':23.10,'press_contact':24.4},
 'max_ball_step':max(dist(x['mechanism']['alert']['ball'],y['mechanism']['alert']['ball']) for x,y in zip(states,states[1:])),
 'scope':'Numerical states at 30fps, not complete visual or auditory review.'}
(R/'qa/alert-handoff-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
if fail:raise SystemExit(1)
