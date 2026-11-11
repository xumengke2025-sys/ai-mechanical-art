# AI 机械图 · Mechanical Animation Lab

黄铜机械、古典科学仪器与机械海洋生物的三维动画实验。以 Three.js 场景、确定性时间轴、相机运动和程序拟音组织影片，并提供一个可独立复刻的 24 秒黄铜机械动画包。

## 快速开始：复刻黄铜动画

安装 Node.js 20 或更高版本，然后在仓库根目录执行：

```sh
cd deliverables/brass-mechanical-animation
node scripts/check-package.cjs
node scripts/init-project.cjs ../../../my-mechanical-film
cd ../../../my-mechanical-film
npm ci
npm run browser:install
npm run smoke
npm run preview
npm run render
```

目标目录 `my-mechanical-film` 必须尚不存在。首次安装需要联网下载依赖、浏览器和编码器；PowerShell 若限制 `npm.ps1`，可使用 `npm.cmd`。

短片验证输出为 `output-smoke/film.mp4`，完整输出为 `output/film.mp4`，默认 24 秒、1920×1080、30fps，包含程序生成的机械拟音。完整说明见 [技能包 README](deliverables/brass-mechanical-animation/README.md)。

## 工程目录

| 路径 | 内容 |
| --- | --- |
| `deliverables/brass-mechanical-animation/` | 独立技能包、模板、便携渲染脚本、参考成片与完整性清单 |
| `output/film-v2/` | 初期三维黄铜场景及共享 Three.js 依赖 |
| `output/film-classic/`、`output/film-eighteenth/` | 古典科学仪器风格的场景迭代 |
| `output/mechanical-whale-*/` | 机械鲸系列场景、镜头与制作脚本 |
| `output/mechanical-jellyfish/` | 机械海蜇场景与动作脚本 |
| `output/audit-*/` | 使用演示内容的审计流程机械可视化场景 |
| 根目录 `build-*.mjs`、`render-*.cjs` | 早期 SVG 构建与视频渲染脚本 |

`output/` 中同时保留了源工程，目录名沿用开发时命名。除便携技能包外，历史脚本可能依赖本机绝对路径、外部技能工具或独立音频素材，需要按环境调整；建议从便携包开始运行。根目录早期 SVG 构建脚本依赖外部 Anatomy 工具包，本仓库未捆绑该工具包。

## 公开同步范围

同步源代码、必要的 Three.js 依赖、素材来源说明，以及便携包附带的参考 MP4 和图片。个人述职材料、原始业务文档、工作检查点、问题记录表、本机工具、参考研究截图、渲染帧、缓存、历史成片和重复 ZIP 留在本地，由 `.gitignore` 排除。

审计场景中的数字与客户记录用于解释流程，使用前应按实际业务规则调整。机械生物采用解释性约束动画；古典仪器风格属于艺术表达。

## 依赖与权利说明

Three.js 的 MIT 许可随各 `vendor/` 目录保存。部分历史音乐脚本依赖 Salamander Grand Piano 采样，来源和许可见 [第三方说明](THIRD_PARTY_NOTICES.md) 及各工程 `ASSETS.md`。便携黄铜包使用程序拟音。

本次公开发布没有为项目原创内容添加额外开源许可证；第三方文件继续遵循各自许可。
