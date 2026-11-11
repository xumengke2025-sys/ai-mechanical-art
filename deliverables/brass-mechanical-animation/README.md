# 黄铜机械动画技能包 v1.0.0

这是当前 V4「十八世纪科学仪器」机械动画的完整复刻包。发这个文件夹或 ZIP 即可；不需要原作者的项目、vibe-video/anatomy 技能或 API 密钥。参考视频为原有 24 秒、1080p30 成片，置于 `assets/reference/`。

## 同事最快开始

电脑先安装 Node.js 20 或更高版本（包含 npm）。首次安装依赖需要联网，下载 Playwright、Chromium 和 FFmpeg。磁盘建议至少留 2GB；全片速度取决于 GPU/CPU。

1. 解压 ZIP，进入 `brass-mechanical-animation` 文件夹。
2. 在终端运行以下命令。路径可替换成自己的新工程目录，目录必须尚不存在：

```powershell
node scripts/check-package.cjs
node scripts/init-project.cjs ../my-mechanical-film
cd ../my-mechanical-film
npm ci
npm run browser:install
npm run smoke
npm run preview
npm run render
```

在 PowerShell 中若 npm.ps1 被执行策略阻止，可将命令中的 `npm` 换成 `npm.cmd`。macOS/Linux 使用同样的 Node/npm 命令；Linux 若提示系统库缺失，可按 Playwright 提示安装 Chromium 系统依赖。详见 [复刻步骤](references/reproduce.md)。

短片结果在 `output-smoke/film.mp4`（2 秒、加速覆盖整段动作）；预览源帧在 `output/qa/`；正式成片在 `output/film.mp4`（24 秒、1920×1080、30fps、H.264 + AAC 48kHz 双声道）。脚本会自动启动并关闭本地渲染服务，不用另开服务器。

## 作为 Codex skill 使用

把整个 `brass-mechanical-animation` 文件夹放进同事的技能目录，默认是用户主目录下的 `.codex/skills/`；若对方设置了 `CODEX_HOME`，则放进其 `skills/` 子目录。保持 `SKILL.md` 位于该文件夹根部。在新的会话中可这样调用：

> 使用 $brass-mechanical-animation 原样复刻随包的24秒十八世纪黄铜机械样片，先验证环境，再导出MP4，并保留可修改工程。

> 使用 $brass-mechanical-animation，把“信息采集、交叉核验、人工复核”做成30秒古典精密仪器动画，保留黄铜、胡桃木与象牙色层级，同一工作件贯穿各站，最终交付1080p MP4。

## 修改与复刻边界

- 修改分辨率、时长和帧率：新工程的 `config.json`。改变时长默认是整体时间缩放；长片需要扩写剧情与动作。
- 修改机构、材质和镜头：`scene.js`，参见 [场景地图](references/scene-guide.md)。修改声音事件：`make-foley.cjs`。
- 原有成片原封不动附带；便携版保留场景构造与默认镜头/时间映射，程序拟音已由 Python 移植为 Node，随机噪声与原音轨不逐样本一致。
- 浏览器、GPU、字体和编码器版本可能导致像素与文件哈希变化，不能用新 MP4 与原片的哈希不同判失败。
- 这是可以扩展的三维场景模板，不是任意机械 CAD/二维图片的一键物理建模器，也不承诺历史复原精度。

第三方 Three.js 采用随包 MIT 许可；Playwright、FFmpeg 依赖由 npm 安装并遵循其各自许可。首次安装需网络，未捆绑跨平台浏览器和编码器二进制。来源及实际验证范围见 [来源记录](references/provenance.md)。
