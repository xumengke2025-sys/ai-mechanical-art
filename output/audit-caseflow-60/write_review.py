"""Archive actual review coverage; does not watch or listen to media."""
from pathlib import Path
import hashlib, importlib.util, json, re

R = Path(__file__).resolve().parent
Q = R / 'qa'
def digest(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def absolute(p):
    return str(Path(p).resolve())
video = R / 'audit-caseflow-60.mp4'
media_hash = digest(video)
manifest = json.loads((Q/'delivery-manifest.json').read_text(encoding='utf-8'))
assert manifest[video.name]['sha256'] == media_hash
manifest[video.name]['decoded_video_frames'] = 1800
manifest[video.name]['decoded_frame_evidence'] = 'ffprobe -count_frames: nb_read_frames=1800; completed with exit code 0'
(Q/'delivery-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

def scene_observation(t):
    if t < 3: return '同一卡匣A017、双导轨及第一工位建立；角注说明虚构案例。'
    if t < 12: return '同季度两次等级位置与差值2级形成跨级线索；A017身份持续。'
    if t < 20: return '卡匣移向资料站，开户本科与问卷硕士分列比对，保留信息差异线索。'
    if t < 30: return '先测评变更、后申购高风险产品；当前说明为动因待核实。'
    if t < 40: return '设备与销售留痕进入比较器；自主修改和诱导均保留为待取证的解释。'
    if t < 48: return '客户A017、经理M04、营业部B02分层归集，指向核查对象。'
    if t < 56: return '人工复核工位与排除/补证/确认分支；压头动作留下复核印记。'
    return '全流程拉远，反馈线路回到规则端，形成闭环；仍为虚构演示。'

coverage_by_frame = {}
full_size = {7.8,17.5,23.0,37.5,52.1,59.5}
for directory, sheet_count in [('final-frames',4), ('press-window',3)]:
    folder = Q/directory
    paths = sorted(p for p in folder.glob('*.jpg') if re.fullmatch(r'\d{3}-\d+\.\d{3}\.jpg',p.name))
    assert len(paths) == (53 if directory=='final-frames' else 40)
    for i,p in enumerate(paths):
        t = float(p.stem.split('-',1)[1])
        frame = round(t*30)
        sheet = folder/f'sheet-{i//16:02d}.jpg'
        assert sheet.exists() and i//16 < sheet_count
        row = coverage_by_frame.setdefault(frame, {'start_frame':frame,'end_frame':frame,'evidence':[],
            'method':'实际查看分页接触表；选定关键帧另查原尺寸图。单点采样，不代表相邻帧已审。',
            'observation':scene_observation(t),'source_video_sha256':media_hash,'evidence_sha256':{}})
        evidence = [sheet]
        if directory=='final-frames' and t in full_size: evidence.append(p)
        for e in evidence:
            a = absolute(e)
            if a not in row['evidence']: row['evidence'].append(a)
            row['evidence_sha256'][a] = digest(e)
        if directory == 'press-window':
            row['observation'] = '50—53.9秒每0.1秒采样序列中的此帧：压下、接触与回升顺序可辨，复核印记出现；只登记此采样帧。'

frames = sorted(coverage_by_frame)
gaps=[]
cursor=0
for frame in frames:
    if frame > cursor: gaps.append([cursor, frame-1])
    cursor=frame+1
if cursor < 1800: gaps.append([cursor,1799])

report = {
    'video_path':absolute(video), 'video_sha256':media_hash,
    'reviewer':{'mode':'same_agent_role_review','id':'/root','description':'同一 Agent 角色复核，非独立审核；沿用既有一轮预算，未增派第二名审片者。'},
    'review_budget':{'selected_mode':'ai_review_once','additional_reviewers':0,'new_review_round':False},
    'coverage':{'decoded_frames':1800,'visual_ranges':[coverage_by_frame[f] for f in frames],
        'visually_reviewed_unique_sample_frames':len(frames),'unreviewed_frame_ranges':gaps,
        'realtime_viewed_ranges_seconds':[],'audio_listened_ranges_seconds':[],
        'audio_status':'pending','audio_perception':{'status':'unavailable','tool':None}},
    'observations':[
        '原PDF全部25页已重新读取，并查看20—21页版面。事实、来源页码与虚构边界见BRIEF.md。',
        '同一卡匣沿连续工位前进，比平行来源展示更明确地呈现线索加工、关联和人工核查顺序。',
        '正式成片53张采样图的4页接触表、压机40张采样图的3页接触表均已实际查看；六张关键帧另看原尺寸。两组采样存在重合，覆盖按唯一帧号合并。',
        '另看过跨站样段第一页16状态及14秒原尺寸；样段不是最终字幕版，不计入最终文件覆盖。样段第二页单帧未看。',
        '机械计算检查：7个采样状态连杆长度约1.05，最低压脚与纸面吻合；计算证据不计作视觉覆盖。',
        '没有实际听音；音轨存在、时长及生成音频峰值/RMS只属技术证据。'
    ],
    'findings':[{'id':'VIS-01','severity':'minor','frame_range':[525,525],'time_range':[17.5,17.5],
        'evidence':[absolute(Q/'final-frames/014-17.500.jpg')],
        'observation':'左上虚构案例角注贴近并叠到旁站标题框边缘；当前资料站主体、字段与字幕未受遮挡。',
        'impact':'局部留白与角注可读性略受影响。','proposed_fix':'后续修改时为常设角注预留固定留白区。',
        'recheck_status':'open_minor'}],
    'limitations':[
        '未覆盖全部1800帧；未审帧区间已完整列出。',
        '未按正常速度完整观看；有时间戳的采样序列不能证明完整节奏、闪帧或运动观感通过。',
        '听音能力不可用，完整音轨及音画同步听感未完成。',
        '同一Agent角色复核，不具有独立审片者的独立性。',
        '无叠加字幕版完成技术解码检查，未单独建立视觉采样覆盖。'
    ],
    'verdict':'incomplete'
}
(Q/'av-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
spec=importlib.util.spec_from_file_location('avcheck','D:/Codex/skills/vibe-video/scripts/check_av_review.py')
avcheck=importlib.util.module_from_spec(spec);spec.loader.exec_module(avcheck)
result=avcheck.check(video,report,1800,60,True)
assert result['visual_gaps']==gaps
(Q/'av-consistency.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
assert result['evidence_consistent'], result
review_text=f'''60秒案例流程版｜交付审核说明

结论：审核未完成（incomplete），不宣称完整视听审核通过。
审核方式：同一 Agent 角色复核，非独立审核；沿用既有一轮预算。
成片：{absolute(video)}
SHA256：{media_hash}

本轮已将平行的来源展示改成客户A017沿六站连续推进：
同季度R1→R3 → 核对学历差异 → 关联后续交易 → 查设备/销售留痕 → 客户/经理/营业部归集 → 人工取证复核、反馈规则。
PDF全部25页已重新研究。客户编号、学历和交易情节为虚构解释性示例；差异不直接等于违规，最终由人工确认。

技术：字幕版及无叠加字幕版均完整解码成功；60秒、1920×1080、30fps、H.264，含AAC双声道48kHz音轨。字幕版实际解码读帧1800。
画面：正式片53张采样与压机窗口40张采样合并为{len(frames)}个唯一帧，已实际查看全部7页接触表；6张关键帧另看原尺寸。未查看的帧号范围详见av-review.json。未按正常速度完整观看。
机械：7状态解析端点检查中，连杆长约1.05，最低接触间隙仅有浮点量级误差；确定性检查14项均一致。
声音：有配乐与拟音，无口播。已做音轨/时长及峰值RMS技术检查，尚未实际听音，不将技术检查当作听感验收。
局部小问题：17.5秒左上角注贴近旁站标题边框，当前工位与字幕清晰；保留为minor。

证据绑定检查通过；该检查只核对记录、媒体和图片哈希，不证明实际观看、听音或创意质量。
'''
(Q/'delivery-review.txt').write_text(review_text,encoding='utf-8')
checkpoint=f'''# 案例版检查点

- 目标：交付60秒1080p机械案例流程片，回应“流程更清晰、用一个例子说明”。
- 已完成：重读原PDF全部25页；按p19—24重构A017跨级→资料差异→交易动因→设备/销售留痕核查→三级归集→人工闭环；事实与虚构边界见BRIEF.md。
- 已完成工程：674个三维实体、14镜头、六站连续导轨、单卡匣；已降低身份铭牌并调整压机机位。新工程独立保存，旧版保留。
- 已完成交付：audit-caseflow-60.mp4与audit-caseflow-clean.mp4，均60秒1080p/30fps、带配乐拟音、无口播。两版完整解码成功；字幕版实际读帧1800。正式两段渲染源码哈希一致、浏览器无错误。
- 验证：14项像素确定性检查一致；7个压机状态连杆长度约1.05、最低接触无实质下穿。
- 实际看图：跨站样段第一页16状态及14秒原尺寸已看，第二页单帧未看；正式片53张和压机40张采样全部接触表已看，共{len(frames)}个唯一最终帧；6张最终关键帧另看原尺寸。
- 审核：同一Agent角色复核，非独立审核，沿用一轮预算。verdict=incomplete；未全帧、未正常速度完整观看、听音不可用。局部角注贴边minor。完整范围和哈希见qa/av-review.json；证据一致性检查通过。
- 下一步：运行package_delivery.py，验证ZIP CRC与清单，再展示成片并标明实际审核状态。
'''
(R/'CHECKPOINT.md').write_text(checkpoint,encoding='utf-8')
print(json.dumps({'unique_reviewed_frames':len(frames),'evidence_consistent':result['evidence_consistent'],'verdict':report['verdict']},ensure_ascii=False))
