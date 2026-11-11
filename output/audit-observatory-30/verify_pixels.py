"""Quantify WebGL pixel differences; retain exact byte checks separately."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

R=Path(__file__).parent/'qa'
report=json.loads((R/'determinism.json').read_text(encoding='utf-8'))
for check in report['checks']:
    if check['equal']:
        check.update(changed_pixels=0,max_channel_delta=0,pixel_tolerance_pass=True)
        continue
    stem=f'determinism-{check["t"]:g}'
    a=np.asarray(Image.open(R/(stem+'-reference.png'))).astype('int16')
    b=np.asarray(Image.open(R/(stem+'-'+check['kind']+'.png'))).astype('int16')
    delta=np.abs(a-b)
    count=int(np.count_nonzero(delta.max(axis=2)))
    maximum=int(delta.max())
    check.update(changed_pixels=count,max_channel_delta=maximum,
                 pixel_tolerance_pass=count<=4 and maximum<=3)
report['pixel_tolerance']={'max_changed_pixels':4,'max_channel_delta':3,
                          'purpose':'Allow a few rasterization rounding differences; geometry/state must remain stable.'}
(R/'determinism-pixels.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'exact_pass':sum(c['equal'] for c in report['checks']),
                  'pixel_tolerance_pass':sum(c['pixel_tolerance_pass'] for c in report['checks']),
                  'total':len(report['checks']),
                  'differences':[c for c in report['checks'] if not c['equal']]}))
if not all(c['pixel_tolerance_pass'] for c in report['checks']):raise SystemExit(1)
