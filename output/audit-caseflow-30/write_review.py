"""Archive actual local role-review evidence, after all listed pages were viewed."""
from pathlib import Path
import hashlib, importlib.util, json
R=Path(__file__).resolve().parent;Q=R/'qa'
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def path(p):return str(Path(p).resolve())
def observation(t):
 if t<3.6:return '刻尺两次读数形成R1/R3差值；结果板由黄铜背面经转轴翻出文字，身份牌常驻。'
 if t<7.7:return '同一卡匣沿连续导轨移站；档案与问卷对齐，差异板连续翻面。'
 if t<11.8:return '平行跟拍进入交易站；先测评、后交易指示及动因待核实保持同一布局。'
 if t<16.5:return '移至光学比较器，横杆沿导轨扫描；两种疑点在支持轴上翻出。'
 if t<20.3:return '跟随同一卡匣到归集站，客户/经理/营业部三层保持空间连续。'
 if t<25.7:return '连续升高进入人工复核；压头压下、接触后回升；人工复核语义保留。'
 return '同一机位连续升高拉远，前后工位逐渐进入画面，结尾标题渐入。'
video=R/'audit-caseflow-30.mp4';sha=digest(video)
manifest=json.loads((Q/'delivery-manifest.json').read_text(encoding='utf-8'))
assert manifest[video.name]['sha256']==sha
index=json.loads((Q/'final-samples/index.json').read_text(encoding='utf-8'))
detail_times={2.4,7.2,11.4,15.6,23.8,29.8}
rows=[]
for item in index:
 evidence=[item['sheet']]
 if round(item['time'],3) in detail_times:evidence.append(item['image'])
 rows.append({'start_frame':item['frame'],'end_frame':item['frame'],'evidence':evidence,
  'method':'实际查看5fps采样与翻牌加密分页接触表；指定关键帧另查原尺寸。仅登记此采样帧。',
  'observation':observation(item['time']),'source_video_sha256':sha,'evidence_sha256':{e:digest(e) for e in evidence}})
gaps=[];cursor=0
for row in rows:
 if row['start_frame']>cursor:gaps.append([cursor,row['start_frame']-1])
 cursor=row['end_frame']+1
if cursor<900:gaps.append([cursor,899])
report={'video_path':path(video),'video_sha256':sha,
 'reviewer':{'mode':'same_agent_role_review','id':'/root','description':'同一 Agent 角色复核，非独立审核。用户反馈修改，沿用一轮预算，未新增审片者。'},
 'coverage':{'decoded_frames':900,'visual_ranges':rows,'unreviewed_frame_ranges':gaps,
  'unique_sampled_frames_viewed':len(rows),'realtime_viewed_ranges_seconds':[],
  'audio_listened_ranges_seconds':[],'audio_status':'pending','audio_perception':{'status':'unavailable','tool':None}},
 'changes':[
  '60秒压缩至30秒，14段独立相机姿态改为单条相机/目标连续轨道。',
  '删除结果牌、扫描横杆、状态铭牌、反馈标记的瞬间显隐；永久身份牌、带支承轴的翻牌、常驻扫描机构与灯色渐变。',
  '压机前平滑升高，完成动作后连续拉远；字幕14条缩为7条，音乐和动作声音重新安排为30秒。'
 ],
 'verification':{
  'technical_manifest':path(Q/'delivery-manifest.json'),
  'motion_audit':path(Q/'motion-audit.json'),
  'determinism':path(Q/'determinism.json'),
  'sample_motion':'19.7—27.7秒1080p样段42个状态的3页接触表已实际查看，不计入最终字幕文件覆盖。',
  'prior_preview':'21张设定帧2页接触表已实际查看；23.8秒原尺寸曾见压机标题裁切，已在正式导出前抬高目标点修正。',
  'facts':'保留前轮依据PDF全部25页核对的案例逻辑；本轮未重读全文。A017等为虚构案例，最终人工确认，无违规定论。'
 },
 'findings':[],
 'limitations':[
  '采样检查未覆盖全部900帧；5fps序列不能证明每个中间帧或正常速度整体观感通过。',
  '未按正常速度完整观看；未实际听音，音轨与响度统计仅属技术证据。',
  '同一Agent角色复核，非独立审核；没有追加独立审片或新一轮审核。',
  '无叠加字幕版只有技术解码检查，未单独建立完整视觉覆盖。'
 ],'verdict':'incomplete'}
(Q/'av-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
spec=importlib.util.spec_from_file_location('avcheck','D:/Codex/skills/vibe-video/scripts/check_av_review.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
check=m.check(video,report,900,30,True);assert check['evidence_consistent'];assert check['visual_gaps']==gaps
(Q/'av-consistency.json').write_text(json.dumps(check,ensure_ascii=False,indent=2),encoding='utf-8')
text=f'''30秒连续运镜版｜修改与审核说明

已交付：30秒、1920×1080、30fps、H.264、AAC双声道；字幕/配乐/拟音，无口播；另有无叠加字幕版。
主片SHA256：{sha}

本轮响应：移除14段相机硬切，用同一卡匣的连续世界路径驱动相机与看向点；跨站同方向跟随，压机前缓慢升高，末尾连续拉远。结果牌从黄铜背面翻出；身份牌常驻；扫描横杆、反馈标记始终存在，状态灯渐变。字幕缩为7条，声音重排为30秒。

技术检查：两版完整解码通过；主片实际解码900帧。901运动采样状态隐藏对象数恒为0；33边界位置连续性检查通过；压机连杆长1.05，最低接触无实质下穿；14项像素确定性检查通过。
实际看图：正式字幕成片{len(rows)}个采样帧的全部{(len(rows)+15)//16}页接触表已看，六张关键帧另看原尺寸；另看过42状态运镜样段及21张制作预览。没有将样段证据冒充最终文件覆盖。
审核结论：incomplete。此次为同一Agent角色复核，非独立审核，沿用一轮预算。未全帧、未按正常速度完整观看、音轨未实听；不宣称完整视听通过。
未审范围和图片哈希见av-review.json。证据一致性检查只验证记录与文件对应，不证明审美或实际感知。
'''
(Q/'delivery-review.txt').write_text(text,encoding='utf-8')
print(json.dumps({'reviewed_sample_frames':len(rows),'pages':(len(rows)+15)//16,'evidence_consistent':check['evidence_consistent'],'verdict':'incomplete'},ensure_ascii=False))
