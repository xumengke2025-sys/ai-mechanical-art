"""Record only the frames actually inspected by the author after final export."""
from pathlib import Path
import json,hashlib
R=Path(__file__).parent
manifest=json.loads((R/'qa/delivery-manifest.json').read_text(encoding='utf-8'));video=R/'audit-convergence-60.mp4';sha=manifest[video.name]['sha256']
times=[0,2.9,3,6.9,7,10,11.9,12,14,16.9,17,20,21.9,22,24,26.9,27,29.9667,30,33.9667,34,36,37.4667,37.5,39,40.9667,41,44,46.9667,47,49.9667,50,51.5,53,53.9667,54,56,58,59.9667]
frames=sorted(set(round(t*30) for t in times));ranges=[]
for i,t in enumerate(times):
 p=R/'qa/final-frames'/f'{i:03d}-{t:.3f}.jpg';sheet=R/'qa/final-frames'/f'sheet-{i//16:02d}.jpg';e=[str(p),str(sheet)];f=round(t*30)
 ranges.append({'start_frame':f,'end_frame':f,'evidence':e,'method':'contact_sheet_visual_inspection','observation':'来源工位、停靠、扫描、复核、片尾及字幕采样；20秒字幕已移到上方，避免叠压铭牌。','source_video_sha256':sha,'evidence_sha256':{str(p):hashlib.sha256(p.read_bytes()).hexdigest(),str(sheet):hashlib.sha256(sheet.read_bytes()).hexdigest()}})
missing=[];last=-1
for f in frames:
 if f>last+1:missing.append([last+1,f-1])
 last=f
if last<1799:missing.append([last+1,1799])
report={'video_path':str(video),'video_sha256':sha,'reviewer':{'mode':'same_agent_role_review','id':'/root','independent':False},'coverage':{'decoded_frames':1800,'visual_ranges':ranges,'unreviewed_frame_ranges':missing,'realtime_viewed_ranges_seconds':[],'audio_listened_ranges_seconds':[],'audio_status':'pending','audio_perception':{'status':'unavailable','tool':None}},'findings':[{'id':'V60-01','severity':'minor','time_range':[17,22],'observation':'初始字幕成片的测评字幕靠近实体铭牌。','impact':'画面底部信息拥挤。','fix':'只将该句字幕移至画面上方，机械镜头与其他字幕保持。','recheck_status':'fixed; final 17/20/21.9-second samples inspected'}],'production_evidence':{'determinism_checks':14,'determinism_pass':True,'source_segments_hashes_match':True,'convergence_sample_seconds':[27,38],'convergence_sample_viewed_states':16,'press_sample_seconds':[50,54],'press_sample_viewed_states':40,'press_contact_full_image_seconds':51.5,'full_decode_both_deliverables':True},'limitations':['本轮原独立审片者不在活动代理列表，按技能退化为同一Agent角色复核，非独立审核。','成片仅看39个采样帧与制作样段序列，非全帧覆盖；未完成正常速度观看。','工具不能提供实际音轨听觉感知，未完成听音，音量与解码不代表听感通过。','解释性运动学装置，不是生产机械工程图、动力学或化学实验仿真。'],'verdict':'incomplete'}
(R/'qa/av-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
text=f'''60秒版交付记录

主片：{video}
SHA256：{sha}
规格：60.000秒 / 1800帧 / 1920×1080 / 30fps / H.264 / AAC 48kHz双声道。
主片与纯画面版均完整解码通过。两段正式渲染源码哈希一致，无浏览器错误。14项乱序与新页面确定性检查通过。

画面：同一Agent角色复核，非独立审核。实际查看最终主片39个采样帧的3页接触表；制作阶段查看27—38秒汇流16状态、50—53.9秒压机40状态及51.5秒原尺寸接触图。未完成全帧或正常速度观看。
修复：17—22秒测评字幕移到上方，避免靠近实体铭牌；最终17、20、21.9秒采样复核。
声音：120 BPM原创钢琴编排与合成机械拟音，无口播。峰值0.239、RMS0.0427；实际听音未完成。
内容边界：AI起草规则需审核验证后执行；MVP月度跑批；相差至少两级是待核查信号；缺失先补证；风险定性与处罚由人工审核确认。
结论：可播放文件及上述工程检查完成；完整视听验收未完成。详细已审/未审帧范围见av-review.json。
'''
(R/'qa/delivery-review.txt').write_text(text,encoding='utf-8')
print(json.dumps({'sha256':sha,'viewed_sample_frames':len(frames),'verdict':'incomplete'}))
