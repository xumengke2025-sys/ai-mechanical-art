export const film={duration:180,width:1920,height:1080,fps:30};
export const chapters=[
 {start:0,end:15,title:'一次改变，意味着什么？',source:[18,19,21],text:'一份客户测评，出现了跨等级变化。正常调整，还是需要核查的信号？审计首先需要看清变化的依据。'},
 {start:15,end:35,title:'把分散资料关联起来',source:[13,19,24],text:'开户档案、风险问卷、测评历史和交易记录，先按同一客户关联。字段需要标准统一，来源需要可追溯。缺失或无法匹配的材料，进入待补证路径。'},
 {start:35,end:55,title:'让业务思路成为可执行规则',source:[14,19],text:'审计人员用业务语言表达排查思路，大模型辅助形成规则脚本草稿。经过审核与验证，再绑定版本，按月度周期运行。把重复的规则翻译工作交给工具，让审计人员集中精力判断问题。'},
 {start:55,end:85,title:'从两类变化发现疑点',source:[21],text:'第一类，比对开户资料与问卷中的收入、职业和学历，保留不一致字段。第二类，检查同一季度测评等级的跨级变化，既包括上调，也包括下调。初筛留下的是有依据的疑点，真实性还需要后续核查。'},
 {start:85,end:115,title:'用交易佐证区分关注程度',source:[20,22],text:'将信息变更异常与变更后的交易佐证组合分析。两项均无，持续关注；单项出现，一般关注；强异常叠加短期购入高风险产品佐证，进入重点关注。这里展示四种证据组合，不代表已经认定违规。'},
 {start:115,end:140,title:'从单客户看到组织聚集',source:[21,22,23],text:'线索沿归属关系连接客户经理和营业部，并按客户去重汇总。客户的证据组合，与机构层面的异常客户人数，分别呈现。这样才能从分散记录中找到值得优先检查的主体，并保留返回原始记录的路径。'},
 {start:140,end:165,title:'把线索交给人工取证',source:[20,24],text:'线索到达人工复核闸。设备指纹、交易流水、销售留痕和相关说明，共同支持进一步核查。补证、排除、确认，都留下复核记录。最终风险定性与处罚，由人工审核确认。'},
 {start:165,end:180,title:'让经验进入下一轮监测',source:[9,16,25],text:'经审核的反馈返回规则复盘与版本管理，供下一轮月度监测使用。从异常到证据，从线索到核查，沉淀一套持续发现、靶向核查、经验留存的审计工作方式。'}
];
export const audioEvents=[
 {t:2.6,type:'clack'},{t:8,type:'tick'},{t:16,type:'rail'},{t:21.5,type:'clack'},{t:26,type:'glass'},{t:32,type:'paper'},
 {t:37,type:'paper'},{t:43,type:'tick'},{t:48,type:'clack'},{t:53,type:'rail'},
 {t:57,type:'rail'},{t:63,type:'tick'},{t:68,type:'clack'},{t:73,type:'tick'},{t:78,type:'paper'},
 {t:86,type:'glass'},{t:90,type:'clack'},{t:97,type:'clack'},{t:104,type:'clack'},{t:111,type:'clack'},
 {t:117,type:'rail'},{t:122,type:'clack'},{t:127,type:'tick'},{t:132,type:'paper'},{t:138,type:'clack'},
 {t:143,type:'paper'},{t:149,type:'clack'},{t:154,type:'clack'},{t:159,type:'paper'},
 {t:166,type:'rail'},{t:171,type:'clack'},{t:176,type:'paper'}
];
export function chapterAt(t){return chapters.find(c=>t>=c.start&&t<c.end)||chapters.at(-1);}
