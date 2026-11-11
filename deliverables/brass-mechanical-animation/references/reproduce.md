# 独立复刻

## 运行环境与安装

Node.js ≥20；npm；可运行 Chromium/WebGL 的桌面或服务器环境。包内场景不需要模型服务、账户、API 密钥或其他技能。`package-lock.json` 锁定 npm 依赖树，Playwright=1.62.1，ffmpeg-static=5.2.0；Three.js r186 的运行文件直接随包。

从 skill 根目录执行 `node scripts/init-project.cjs <全新工程路径>`。初始化器复制模板和渲染/拟音脚本，拒绝覆盖既有路径。路径带空格时用引号。进入新工程运行：

```text
npm ci
npm run browser:install
npm run smoke
npm run preview
npm run render
```

首次两步联网下载依赖和浏览器；之后场景文件完全本地加载。`ffmpeg-static` 安装脚本负责下载平台对应 FFmpeg，不要在正式安装时加 `--ignore-scripts`。浏览器安装到 Playwright 管理的缓存。Linux 系统依赖缺失时按提示处理（有系统管理权限的环境可运行 `npx playwright install --with-deps chromium`）。Windows 执行策略限制 npm.ps1 时使用 `npm.cmd`，不用改全局安全设置。

渲染器绑定 `127.0.0.1` 的随机空闲端口，用确定性时间逐帧截图并通过管道编码；不依赖固定8769端口、Python HTTP服务或录屏实时帧率。运行时保持命令存活；全片较慢时看每约2秒影片时长的进度行判断实际进展。

## 命令与输出

| 命令 | 作用 | 输出 |
| --- | --- | --- |
| `npm run smoke` | 640宽、12fps、2秒加速覆盖全片动作；检查环境 | `output-smoke/film.mp4`、verification.json |
| `npm run preview` | config中指定时刻、正式尺寸的源PNG | `output/qa/frame-*.png`、preview.json |
| `npm run render` | 默认24秒1080p30，合成程序拟音并完整解码检查 | `output/film.mp4`、film-silent.mp4、mechanical-foley.wav、verification.json、qa/decoded-middle.png |
| `npm run verify` | 重新解码正式成片并报告规格、帧数与哈希 | 终端JSON；不覆盖原报告 |
| `node render.cjs --smoke --out check-02` | 在另一个目录运行短片 | `check-02/` |
| `node render.cjs --out take-02` | 另存一轮正式输出 | `take-02/` |
| `node render.cjs --verify --out take-02` | 检查该轮输出 | 终端JSON |

已有视频时拒绝覆盖，换一个 `--out` 目录。预览图允许刷新。不要在同一输出目录并行渲染。报错留下的片段不能当成成功结果，修复原因后使用新输出目录。

## 可选的系统工具

默认使用 npm 安装的 Chromium 与 ffmpeg-static。已有工具或平台下载受限时，可设置实际可执行文件的绝对路径，路径只是示例，不要原样复制不存在的地址：

```powershell
$env:CHROME_PATH='C:/tools/chrome/chrome.exe'
$env:FFMPEG_PATH='C:/tools/ffmpeg/bin/ffmpeg.exe'
node render.cjs --smoke --out system-check
```

macOS/Linux 例如 `CHROME_PATH=/实际路径/chromium FFMPEG_PATH=/实际路径/ffmpeg node render.cjs --smoke`。FFmpeg 需要支持 libx264、AAC、image2pipe；未找到 ffmpeg-static 时还会尝试 PATH 中的 `ffmpeg`。

## 常见失败

- `Cannot find module playwright`：确认在初始化后的工程执行了 `npm ci`。
- 浏览器可执行文件不存在：运行 `npm run browser:install`，或设置正确的 CHROME_PATH。
- FFmpeg 下载失败或过慢：检查首次安装网络与代理；已有支持libx264/AAC的FFmpeg时，可用 `npm ci --ignore-scripts` 跳过二进制下载，运行 `npm run browser:install`，再设置 `FFMPEG_PATH` 并执行短片检查。这是显式使用已有工具的替代路径，常规安装仍用 `npm ci`。
- WebGL 初始化失败或 context lost：先跑短片检查，确认机器能运行 Chromium WebGL。硬件或软件渲染均可，但性能不同；不要误报完整导出通过。
- `duration * fps` 非整数、奇数画幅或无效CRF：修改 config。H.264 yuv420p 要求偶数宽高。
- 长片只得到慢动作：config.duration 只缩放既有18秒内部动作；新增内容需修改 scene 和声音事件。
