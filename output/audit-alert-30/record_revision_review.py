"""Record actual production inspection of this exact revision. Does not review video."""
from pathlib import Path
import json,hashlib,datetime
R=Path(__file__).parent
expected='8252500883dc0d545e8dc67f54c4ebd6e3b45ecebf8caad3e96ee7ac0cdbece9'
p=R/'audit-alert-30.mp4';sha=hashlib.sha256(p.read_bytes()).hexdigest()
if sha!=expected:raise RuntimeError('Different video: inspect that output before recording coverage.')
samples=json.loads((R/'qa/final-samples/index.json').read_text(encoding='utf-8'))
observations=[
 {'range_seconds':[0,7.7],'observation':'Opening identifies AI non-site audit; shared-scale R1/R3 needles and delta reveal remain readable in sampled frames.'},
 {'range_seconds':[7.7,8.2],'observation':'Inherited brief carrier occlusion behind the meter during the rise; carrier reappears before comparison. Not a newly introduced object pop.'},
 {'range_seconds':[8.2,17.0],'observation':'Source labels, mismatch/trade flips and optical trace check retain their sequence; no new abrupt placement observed in samples.'},
 {'range_seconds':[17.0,19.84],'observation':'One teal bead moves from A017 through customer, owning manager, branch; labels distinguish ownership. Count flips after branch arrival; piping avoids manager text at central reading position.'},
 {'range_seconds':[19.84,22.667],'observation':'Count 10 and threshold >=10 visible; annunciator turns ruby after count reveal. Red ball lifts out of sleeve then travels continuous twin wires toward receiving cup.'},
 {'range_seconds':[22.667,26],'observation':'Ball received before acceptance flip; A017 reaches press. Smaller acceptance plaque avoids card surface and press contact. Receiver supports partially overlap the redundant lower station plaque; subtitle states manual verification.'},
 {'range_seconds':[26,29.967],'observation':'Teal feedback bead travels front conduit back toward initial ratchet; final statement keeps human confirmation explicit.'}
]
review={'video':str(p.resolve()),'sha256':sha,'recorded_at':datetime.datetime.now().astimezone().isoformat(),
 'delivery_mode':'ai_review_once','context':'User-requested targeted revision of the same project; no new independent full-review round.',
 'reviewer':'Main production agent','conclusion':'incomplete','total_frames':900,
 'visual':{'method':'Actually viewed 14 decoded MP4 contact sheets, covering all 213 selected sample frames; plus 3 full-size decoded frames. Sampling, not full-frame AV review.',
 'viewed_frame_numbers':[s['frame'] for s in samples],'sheets_viewed':[str((R/'qa/final-samples'/f'sheet-{i:02d}.jpg').resolve()) for i in range(14)],
 'full_size_viewed_frame_numbers':[619,693,732],'full_size_times':[20.6333333333,23.1,24.4],'observations':observations},
 'playback':{'normal_speed_full_playback':False,'all_900_frames_viewed':False},'audio':{'full_track_listened':False,'technical_decode':True},
 'technical':{'full_video_and_audio_decode':True,'motion_samples':901,'filing_and_alert_handoff_checks':'qa/alert-handoff-check.json','determinism_exact_checks_passed':24},
 'remaining_limitations':['Incomplete visual and auditory coverage; cannot claim complete AV approval.','Inherited 7.7-8.2 second short carrier occlusion.','Red ball cup supports partly overlap lower redundant station plaque.'],
 'facts':'Re-read supplied PDF pages 20-23. Delta>=2 is initial screening; branch anomaly count>=10 is high-risk special on-site verification threshold. Count 10 and identities are fictional examples; ownership is not liability.'}
(R/'qa/av-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['30秒告警闭环版 · 本轮制作检查',f'MP4 SHA256: {sha}',
 '实际查看：14页成片解码接触表，213个采样帧；另看20.633、23.1、24.4秒三张原尺寸成片帧。',
 '修复：初筛与高风险阈值分开；单珠串联客户/经理/营业部；增加计数→红灯→红球→告警受理→人工核查。预览发现的计数牌裁切、经理字被管线遮挡、受理大牌遮挡压印均已处理。',
 '数值：901状态、42相机边界、连杆长度1.10恒定、压脚最小间隙0；六类告警交接条件通过；24项乱序/新页面PNG字节完全一致。',
 '文件：两版视频/音轨完整解码通过，主片900帧、30秒、1080p30。',
 '审核结论：incomplete。未逐帧看全部900帧、未正常速度完整观看、未实听音轨；不宣称完整视听通过。',
 '剩余：继承的7.7—8.2秒载体短暂被量仪遮挡；接收杯支柱局部挡住下方冗余工位牌，字幕已明确人工取证复核。',
 '业务边界：原PDF第20—23页重读；10人为虚构示例；归属经理/营业部不表示责任已确认。']
(R/'qa/delivery-review.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'video_sha256':sha,'sample_frames_actually_viewed':len(samples),'full_size_frames_actually_viewed':3,'conclusion':'incomplete'}))
