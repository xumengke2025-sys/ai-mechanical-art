"""Persist the production observations actually made on the delivered file."""
from pathlib import Path
import json,hashlib,subprocess
R=Path(__file__).parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
p=R/'audit-observatory-30.mp4';digest=sha(p)
index=json.loads((R/'qa/final-samples/index.json').read_text(encoding='utf-8'))
observations=[
 '开场整体明确分区，AI非现场审计与跨级核查问题先出现，之后相机靠近量仪。',
 '量仪两针从重合到R1/R3分离，保留同季度标尺和差值结果，机位连续。',
 '差值翻板旋出，载体开始爬升；进入下一工位时短暂被量仪遮挡。',
 '相机升高后载体从量仪后重现，档案与问卷并置，身份A017延续。',
 '差异、后续交易翻板依次旋出；载体向双透镜区横移，无瞬时对象替换。',
 '后桥横移与相机跟随衔接，双透镜开合及扫描杆动作有连续中间态。',
 '两种待核解释以问号保留；压机前景齿轮经过，镜头转向中央归集。',
 '中央三个层级依次变为青色，客户/经理/营业部标牌可读，导管永久存在。',
 '中央归集留有停顿，相机再转向压机；载体沿下坡转入右前区域。',
 '载体进入压印区后停住，曲柄连杆带动压脚下降；后方人工确认标牌部分被曲柄遮挡。',
 '24.4秒压脚与纸面接触后复位，反馈珠沿前方管道移动；镜头开始拉开。',
 '反馈回到起点，全景和片尾文案稳定；末端棘爪动作在全景中较小。'
]
viewed=set(x['frame'] for x in index)
gaps=[]
for f in range(900):
 if f not in viewed:
  if gaps and gaps[-1][1]==f-1:gaps[-1][1]=f
  else:gaps.append([f,f])
ranges=[]
for i,x in enumerate(index):
 sheet=Path(x['sheet']);image=Path(x['image'])
 ranges.append({'start_frame':x['frame'],'end_frame':x['frame'],
  'evidence':[str(sheet.resolve())], 'method':'contact_sheet_sampling',
  'observation':observations[i//16], 'source_video_sha256':digest,
  'evidence_sha256':{str(sheet.resolve()):sha(sheet)}})
full=[x for x in index if x['frame'] in [24,168,306,468,594,732,864]]
review={'video_path':str(p.resolve()),'video_sha256':digest,
 'reviewer':{'mode':'same_agent_role_review','id':'root','independent':False},
 'delivery_mode':'ai_review_once','review_budget':'Same project user-directed revision; original round retained, no new independent full review.',
 'coverage':{'decoded_frames':900,'visual_ranges':ranges,
  'unreviewed_frame_ranges':gaps,'sampled_frames':len(viewed),
  'full_size_frames':[{'frame':x['frame'],'path':x['image'],'sha256':sha(Path(x['image']))} for x in full],
  'realtime_viewed_ranges_seconds':[],'audio_listened_ranges_seconds':[],
  'audio_perception':{'status':'unavailable','tool':None},'audio_status':'pending'},
 'technical':{'width':1920,'height':1080,'fps':30,'duration':30,'decoded_frames':900,
  'full_video_and_audio_decode_exit':0,'audio':'AAC 48kHz stereo; synthesized effects and sampled piano; no narration'},
 'findings':[
  {'id':'OBS-01','severity':'minor','frame_range':[231,243],'time_range':[7.7,8.1],
   'evidence':[str((R/'qa/final-samples/sheet-03.jpg').resolve())],
   'observation':'量仪短暂遮住移动卡匣，随后升机位重新建立同一A017。',
   'impact':'身份跟随有短暂遮挡。','proposed_fix':'若后续继续调整，可提前升高相机。','recheck_status':'remaining'},
  {'id':'OBS-02','severity':'minor','frame_range':[660,780],'time_range':[22,26],
   'evidence':[str((R/'qa/final-samples/162-24.400.jpg').resolve())],
   'observation':'后方人工确认标牌被曲柄部分遮挡；前方工位牌与字幕完整表达人工复核。',
   'impact':'冗余环境标牌局部不可读。','proposed_fix':'若后续继续调整，可将标牌移至侧柱。','recheck_status':'remaining'}],
 'limitations':['本轮为主Agent制作检查，非新增独立审核。',
  '实际查看191个采样帧的12页接触表，另看7张原尺寸图；未覆盖全部900帧。',
  '未按正常速度完整观看，音轨未实听；完整视听审核未完成。',
  '事实沿用前轮PDF全部25页核对结果，本轮未重读全文。'],
 'verdict':'incomplete'}
(R/'qa/av-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf-8')
text='''30秒多视角版交付检查

制作：主Agent；同一项目用户反馈修改，沿用既有一轮审核预算，未新增独立全面审核。
内容：A017跨级线索→资料差异→后续交易/留痕核查→三级归集→人工复核→规则反馈。
构图：分层马蹄庭院、七组连续机位；古典量仪、丝杠、滴定管、双透镜光阑、三环、连杆压印。

技术：1920×1080，30fps，30秒，实际解码900帧，主片和无叠加字幕版均完整解码通过。
机械：901个状态/42个边界检查；连杆长度1.10恒定，最小压脚间隙0；所有核心对象始终存在。
寻址：14项像素容差检查通过；10项字节一致，4项各有1像素的2—3级栅格化微差。

实际观察：12页接触表的191个采样帧全部看过，另看0.8、5.6、10.2、15.6、19.8、24.4、28.8秒七张原尺寸成片解码图。检查采样序列中的机位变化、遮挡重现、翻板、扫描、归集与压印；未见明显位置跳变。短暂卡匣遮挡及后方冗余标牌部分遮挡保留，见av-review.json。

审核结论：incomplete。未看全部900帧，未按正常速度完整观看，音轨未实际听审，不能宣称完整视听审核通过。实际范围、证据和成片哈希见av-review.json。
'''
(R/'qa/delivery-review.txt').write_text(text,encoding='utf-8')
print(json.dumps({'reviewed_samples':len(viewed),'full_size_frames':len(full),'verdict':'incomplete','sha256':digest}))
