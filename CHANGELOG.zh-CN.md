# Changelog

## v2.0.47

- 修复：回退到已验证稳定的 React 18、react-window 1 与 Zustand 4 补全运行时，解决 v2.0.46 升级后在终端输入时建议面板无法打开的问题
- 变更：保留兼容的 Vite 8、Vitest 4 及其他构建工具升级，同时将补全列表、尺寸监听和状态更新恢复为稳定实现
- 修复：纠正本地安装脚本的仓库根目录与构建脚本路径，确保从仓库根目录正确装配并安装应用
- 功能：新增安装、故障排查、Ghostty 与 Fig 替代方案网站指南，并补充各路由的 SEO 元数据
- 测试：通过生产构建、lint、177 项测试及已安装应用的终端冒烟验证确认回退有效

## v2.0.46

- 变更：将前端运行时与构建工具升级到 React 19、Vite 8、Vitest 4、TypeScript 6、Zustand 5、Zod 4 和 react-window 2；Tailwind 保持在兼容 Safari 15 的最新 v3 版本
- 变更：使用浏览器原生 ResizeObserver 替代仅支持 React 18 的封装，迁移列表虚拟化与 Zustand 5 的严格状态更新，并按 React 19 行为调整设置输入框和 Hooks
- 维护：刷新兼容的 lint、格式化、codegen 与工作区依赖，移除废弃类型和未使用的 lint 插件，迁移 Vitest workspace 配置，并锁定已修复的传递依赖以保持安全审计无漏洞
- 测试：在 Node 22.23.1 下重复执行全量构建、覆盖率测试和随机顺序测试，共 177 项测试通过

## v2.0.45

- fix: 文件与目录建议图标改用真实图片元素渲染；本地图标加载失败时自动回退到内置图标
- change: WebView 编译目标升级至 Safari 15，移除旧浏览器兼容与 polyfill 依赖，并将本地和 CI 工具链统一为 Node 22.23.1 与 pnpm 11.13.0
- change: macOS 发布链路端到端收敛为纯 ARM64；删除废弃的 universal/Linux/Windows Makefile 与 Linux 打包资源，签名前裁掉 Sparkle 的 Intel slices，并在应用和 DMG 装配阶段拒绝非 ARM 二进制
- chore: 删除废弃或未使用的前端类型与依赖、精简 lockfile、降低 API 请求 codegen 噪音，并修正 README 中的 CLI crate 与二进制名称

## v2.0.44

- feat: 移除无条件安装的 macOS LaunchAgent，改为由用户控制的登录启动集成；macOS 13+ 使用 `SMAppService.mainAppService`，macOS 12 回退到不启用 `KeepAlive` 的 LaunchAgent
- fix: 登录启动设置现在与系统真实注册状态同步；升级时迁移并清理两种历史 LaunchAgent，登录启动保持静默，卸载时完整注销所有启动项
- change: 在 Rust 构建参数和应用包元数据中明确将 macOS 12 设为最低支持版本
- chore: 将 nightly 专属 rustfmt 配置迁移到仓库固定的 stable 工具链，同步更新 CI、安装环境和文档，并对 Rust workspace 完成一次机械格式化

## v2.0.43

- fix: autocomplete 窗口处于 disabled 状态时仍允许向 webview 发送 emit 事件，使 Dashboard 聚焦期间修改的补全主题等设置可以立即生效，不再需要重启才能刷新
- fix: 切换主题时保持 Dashboard 使用 macOS 原生主色调；主题设置现在只影响命令补全下拉框
- chore: 删除本 fork 未接入 CI 或 workspace 的上游 `figterm` / `fig-api` 测试脚手架、独立 shell 启动性能分析脚本，以及过时的模型 ZIP Git LFS 规则

## v2.0.42

- feat: 设置面板从五个分区精简为三个（Appearance / Behavior / About）—— History 设置合并为 Behavior 内的卡片，Advanced 分区移除
- feat: 从设置界面移除低频且危险的选项（自动执行危险命令 / git 别名、接受建议后立即执行、脚本超时等冷门开关）；这些设置仍可通过 `ec settings` 命令修改
- feat: 重构 About 页 —— 反馈问题入口移入 Troubleshooting 卡片、与 `ec doctor` 诊断相邻，GitHub / Release Notes 移至版权声明上方的页脚区，版本徽章点击即可复制版本信息，并全面精简了描述文案
- feat: 设置窗口启用 macOS 原生毛玻璃效果，并随窗口焦点状态联动样式
- change: 默认主题改为 `github-dark`，开机自启默认关闭

## v2.0.41

- feat: 扩充匿名统计事件 —— 新增 `daily_heartbeat`（活跃设备统计，24 小时最多一次）、`integration_installed`（带 `integration` 属性）、`app_uninstalled`（由 `uninstall.sh` 上报），`app_opened` 增加 `is_startup` 属性以区分开机自启与手动打开
- feat: 高频补全事件（`autocomplete_shown` / `autocomplete_accepted`）改为本地 SQLite 聚合计数，随每日心跳以 `count_*` 属性批量上报 —— 每天一个请求，而不是每次按键一个
- feat: 统计事件新增 `shell`（登录 shell）与 `terminal`（终端模拟器 best-effort 检测）公共属性
- fix: 发送失败的统计事件会持久化到离线队列（`telemetry_queue.jsonl`，上限 200 条，保留原始时间戳），在下次启动或下次发送成功时补发，不再静默丢失
- fix: 统计上报的 HTTP 客户端现在携带 `easy-complete/<version>` User-Agent —— 无 UA 的请求会被分析代理前面的 Cloudflare Bot 防护直接拦截
- fix: 注册之前未挂载的 `ec telemetry` 子命令（`enable` / `disable` / `status`，及供安装/卸载脚本使用的隐藏 `track`）；CLI 来源的事件在进程退出前会等待发送完成
- fix: 设置页「反馈问题」链接改为指向仓库 issues 列表，不再跳转模板选择页

## v2.0.40

- fix: 更新 bundled completion specs 至 `@chen86860/autocomplete-specs@3.0.7`，修复 `pnpm` spec 运行时 import 崩溃导致 `pnpm` 无法打开补全面板的问题
- test: upstream specs 包现在会在编译后 smoke import 生成的 spec 文件，避免顶层运行时错误进入下游发布

## v2.0.39

- feat: 更新 bundled completion specs 至 `@chen86860/autocomplete-specs@3.0.6`，刷新 `bun`、`npm`、`pnpm`、`rush`、`yarn` 等标准库 specs，并保留现有 `aws` / `az` 排除策略
- chore: 将 `@chen86860/autocomplete-specs` 作为 root npm devDependency 管理，由 `package.json` 与 `pnpm-lock.yaml` 固定版本；`sync-bundled-specs.mjs` 默认从 `node_modules` 读取已安装包，不再直接从 npm registry 下载 tarball

## v2.0.38

- perf: bundled completion specs 在原有排除 `aws` 的基础上新增排除 `az`（Azure CLI）命名空间，`bundle/specs` 体积从 ~40MB 降至 ~31MB（绝大多数用户不会用到这两个云厂商 CLI）
- docs: changelog 拆分为英文版 `CHANGELOG.md` 和中文版 `CHANGELOG.zh-CN.md`，与仓库现有的 `README.md` / `README.zh-CN.md` 命名习惯保持一致；`scripts/bump-version.sh` 与 `CLAUDE.md` 现在会提示每次发版需同时更新两个文件

## v2.0.37

- feat: 更新 bundled completion specs 至 `@chen86860/autocomplete-specs@3.0.5`，新增 `bash`、`corepack`、`pbcopy`、`sha256sum`、`sleep`、`xattr` 等内置 specs，并刷新 `brew`、`bun`、`copilot`、`gh` 等标准库 specs

## v2.0.36

- feat: 更新 bundled completion specs 至 `@chen86860/autocomplete-specs@3.0.4`，刷新 `claude`、`dynamic`、`gemini`、`pnpm` specs

## v2.0.35

- perf: 新增 `dist` 发布构建 profile（thin LTO + `codegen-units=1` + `strip` + `panic=abort`），分发二进制体积大幅下降（如 `ec` 18.9MB → 8.6MB），且不影响本地 `cargo run --release` 迭代速度
- perf: 移除 autocomplete overlay 主 bundle 中的死代码/仅调试用 polyfill（`@juggle/resize-observer`、`util`、`deep-object-diff` 改为按需动态加载或内联实现），主 chunk 从 632KB 降至 545KB
- ci: 新增 `dist` profile 冒烟构建，提前暴露发布构建专属问题（`panic=abort`/LTO/strip）

## v2.0.34

- feat: bundled completion specs 改为从 npm 包 `@chen86860/autocomplete-specs` 同步，替代旧的 GitHub release zip 更新方式
- feat: 更新 bundled completion specs 至 `@chen86860/autocomplete-specs@3.0.3`，并继续从实际文件树生成 `index.json` 以保留 `dynamic` 等 diff-versioned specs

## v2.0.33

- feat: 更新 bundled completion specs 至 `chen86860/autocomplete-specs` 的 `spec-build-number-0.4.0` release，刷新 `claude`、`codex`、`gemini`、`dynamic` 等标准库 specs

## v2.0.32

- feat: 更新 bundled completion specs 至 `chen86860/autocomplete-specs` 的 `spec-build-number-0.3.0` release，新增 `claude`、`codex`、`gemini`、`uvx` 等标准库 specs
- fix: 对命令面板不受内置资源支持的命名 Fig icon 增加 fallback，修复 `pnpm dev` 等 package.json scripts 建议显示空白文档图标的问题

## v2.0.31

- fix: 修复命令面板中 `fig://icon?...` 命名图标被错误改写为无效静态资源路径，导致部分命令前只保留空白占位、不显示图标的问题
- test: 为命令面板图标 URL 转换增加回归测试，确保命名 Fig icon 和外部 URL 不再被错误处理

## v2.0.30

- fix: release appcast 默认生成最多 8 个 delta，并拉取最近 8 个正式 release 作为 Sparkle archives 输入，覆盖更多旧版本到最新版的增量更新路径
- fix: 保持 appcast delta URL 与 GitHub release asset 文件名一致，避免 Sparkle 因 delta 404 回退到完整 DMG

## v2.0.29

- fix: dashboard 从菜单栏/二次启动打开时显式激活 macOS App，避免偶发触发“点击桌面/显示桌面”导致窗口被挤到角落

## v2.0.28

- feat: 将设置里的 Fuzzy Matching 设为默认开启，未写入用户配置时设置页和补全运行时都会默认启用模糊搜索
- chore: 新增共享默认设置入口，避免设置页显示状态和 autocomplete 实际行为不一致

## v2.0.27

- feat: 发布仓库清理与 CI 质量门禁正式版，包含重复 autocomplete package 移除、Easy Complete 品牌/发布元数据清理、PR CI gate 与 Rust/JS 测试修正
- fix: release workflow 对 `alpha` / `beta` / `rc` SemVer tag 使用更严格的 prerelease 判断，避免正式 Sparkle appcast 混入预发布版本

## v2.0.27-beta.1

- prerelease: 先在 beta tag 发布大规模仓库清理与 CI 质量门禁，避免直接进入正式用户的 Sparkle latest 更新通道
- chore: 删除重复的 autocomplete package，统一使用 `packages/autocomplete-app`
- chore: 清理 Easy Complete fork 的包元数据、发布文案、产品路径和测试快照中的旧上游品牌残留
- ci: 新增 PR/主分支质量门禁，覆盖 JS build/lint/test、website build、Rust fmt/clippy/test

## v2.0.26

- feat: Sparkle 发布链路支持 delta update：release CI 会保留稳定 DMG 下载入口，同时生成版本化 Sparkle full-update DMG，拉取最近历史 release 作为 archives 输入，并上传 `appcast.xml` 与 `.delta` 更新包
- docs: 更新 Sparkle release 文档，补充 delta update 的 CI 行为、本地生成命令和需要上传的发布资产

## v2.0.25

- feat: 更新 bundled completion specs 至 `chen86860/autocomplete-specs` 的 `spec-build-number-0.2.0` release，并重新生成随包内置的 `bundle/specs`

## v2.0.24

- feat: 自动更新路径补充 `info!` 级日志(arming 计划检查、Sparkle framework 加载、updater 就绪并关闭自动下载、手动/后台检查触发、计划更新弹窗前激活 app)——此前全程仅 `debug!` 且 `fig_log` 默认 ERROR 级,排查时日志空白;现可在 `Q_LOG_LEVEL=info` 下观察完整自动更新时间线
- fix: 托盘"更新不可用"提示由误导性的 _"Sparkle.framework is not bundled in this build"_ 改为准确描述(更新器无法启动:framework 缺失或初始化失败,详见日志)

## v2.0.23

- fix: 自动更新仍"用不了"的真正根因——后台检查到新版本时 Sparkle 因 `automaticallyDownloadsUpdates`(`SUAutomaticallyUpdate` 默认值残留为 YES）走**静默下载安装**,而本应用 ad-hoc 签名且 `SUEnableInstallerLauncherService` 关闭、特权安装无法完成,导致既不弹窗也装不上(仅手动检查可弹窗);现在创建 updater 后显式 `setAutomaticallyDownloadsUpdates: NO`,强制后台检查改为弹窗提示,并在每次启动把脏默认值写回自愈
- fix: 新增 `ECSparkleUserDriverDelegate`(`SPUStandardUserDriverDelegate`),让 `LSUIElement` 菜单栏 agent 的计划检查弹窗立即出现在最前,而非被 Sparkle 的 gentle-reminder 推迟——`standardUserDriverShouldHandleShowingScheduledUpdate…` 返回 `YES`,并在 `willHandleShowingUpdate` 中 `activateIgnoringOtherApps:`

## v2.0.22

- feat: 补全 specs 改为从自维护的 fork [`chen86860/autocomplete-specs`](https://github.com/chen86860/autocomplete-specs) 的 Release 获取（其 CI 编译 `src/*.ts` 并发布 `specs.zip`），`sync-bundled-specs.mjs` 下载 zip 后自行按文件树推导 `index.json`；保留旧的逐文件 CDN 同步作为 fallback
- feat: spec 来源**锁定到固定 release tag**（`SPECS_TAG`，默认 `spec-build-number-0.1.0`）而非 `latest`，构建可复现、不会静默变更；可经 `BUNDLED_SPECS_TAG` / `BUNDLED_SPECS_RELEASE_ZIP` 覆盖
- docs: CLAUDE.md 更新 Bundled Specs，说明新来源与版本锁定机制

## v2.0.21

- perf: 精简打包的补全 specs——`sync-bundled-specs.mjs` 新增 `BUNDLED_SPECS_EXCLUDE`（默认排除 `aws`），同时过滤磁盘文件与 `index.json`，bundle 体积从 ~76 MB 降至 ~40 MB（AWS CLI specs ~36 MB / 419 条，绝大多数用户从不触发）
- feat: 打包的 `Info.plist` 增加 `LSApplicationCategoryType`（应用分类）与 `NSHumanReadableCopyright`（版权信息），版权年份自动生成、可经 `COPYRIGHT` 环境变量覆盖
- chore: 从源图 `icon.png` 重新生成 `icon.icns`、`AppIcon.iconset` 与各尺寸图标 PNG，三方保持一致
- chore: 移除未被任何构建脚本引用的 `bundle/dmg/VolumeIcon.icns`
- docs: CLAUDE.md 增加「Bundled Specs」小节，说明 specs 构建/排除机制及无网络回退的运行时行为

## v2.0.20

- fix: 修复自动更新「不自动检测」的问题——作为 `LSUIElement` 后台 agent 无法弹出 Sparkle 首次授权对话框，导致计划检查被静默禁用；现在创建 updater 后主动 `setAutomaticallyChecksForUpdates: YES`，并在打包的 `Info.plist` 中声明 `SUEnableAutomaticChecks` 与 `SUScheduledCheckInterval`（1 天）
- feat: 设置面板 About 页新增 Troubleshooting 卡片，指引用户在终端运行 `ec doctor` 进行诊断（命令可一键复制）

## v2.0.19

- feat: 新增 `fig_telemetry` crate，接入 PostHog 遥测（安装量、打开次数、版本分布），通过编译期环境变量 `POSTHOG_ENDPOINT` / `POSTHOG_API_KEY` 注入，未配置时静默禁用
- feat: 上报事件附带 `app_name`、`app_version`、`os_version`、匿名 `device_id`，支持多客户端区分
- feat: Onboarding 权限 gate 底部新增遥测告知区块与开关（默认开启）
- feat: 设置面板 About → Privacy card 提供遥测开关入口
- feat: GitHub Actions release workflow 支持通过 repository secrets 注入遥测配置
- fix: 修复自动检查更新失效问题——`SPUStandardUpdaterController` 改为通过 `exec_async` 在主线程创建，启动时的后台检查延迟 5 秒执行以确保 event loop 已就绪

## v2.0.18

- fix: dashboard 启动时权限检查期间显示 loading，避免权限页面一闪而过
- feat: 在权限 gate 中加入 Shell Integration 安装步骤，解决首次 DMG 安装后 .zshrc 无自动注入的问题；可访问性授权完成后方可操作
- fix: ec doctor 警告信息（bash/zsh dotfile check）现在显示检查项名称，与错误格式一致
- fix: ec doctor terminal 集成检查不再输出无意义的 `Q_TERM=` 空行，版本不匹配时改为显示具体版本号

## v2.0.17

- feat: update version to 2.0.17 and add auto-update functionality

## v2.0.16

- Enhance dashboard components with new features

## v2.0.15

- Add "Check for Updates" functionality and improve UI elements

## v2.0.14

- Add "Check for Updates" functionality and improve UI elements

## v2.0.13

- Fix check for updates button not working

## v2.0.12

- Fix check for updates button not working

## v2.0.11

- Fix check for updates button not working

## v2.0.10

- Fix check for updates button not working (now triggers Sparkle native update UI)
- Fix dashboard accent color not updating when macOS system accent color changes
- Add changelog support for Sparkle update notifications

## v2.0.9

- Add "Check for Updates" button in the About section of the dashboard
- Enhance DMG background image generation

## v2.0.8

- Add window close button to the dashboard

## v2.0.7

- Fix permission gate readiness state detection

## v2.0.6

- Add permission management with accessibility permission prompts on first launch
- Add settings layout with sidebar navigation

## v2.0.5

- Add launch at login setting
- Initial dashboard settings panel

## v2.0.4

- Add shell history integration settings (merge shells, Ctrl-R toggle, custom history command)

## v2.0.3

- Add fuzzy search and sort method settings

## v2.0.2

- Add font family and font size settings for the autocomplete popup

## v2.0.1

- Initial release of Easy Complete
- IDE-style inline terminal autocomplete via native overlay window
- macOS input method for cursor tracking in Ghostty, Kitty, WezTerm, Zed, Alacritty
