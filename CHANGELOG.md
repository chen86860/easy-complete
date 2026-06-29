# Changelog

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
- fix: 托盘"更新不可用"提示由误导性的 *"Sparkle.framework is not bundled in this build"* 改为准确描述(更新器无法启动:framework 缺失或初始化失败,详见日志)

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
