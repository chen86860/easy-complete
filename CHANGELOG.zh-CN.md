# Changelog

## v2.3.2

- 修复：保持菜单栏图标原有形状，生成 Retina 分辨率资源并消除边缘锯齿（#187）
- 修复：为应用图标添加透明留白，使其在 Dock 和 Finder 中与相邻图标的大小一致（#186）

## v2.3.1

- 修复：程序已在运行时再次打开 Easy Complete，现在会重新弹出设置窗口——macOS 的 LaunchServices 只会唤醒已有进程而不会启动第二个，因此「已在运行」的处理分支根本不会执行，而应用自己的 reopen 处理函数因为 tao 的 app delegate 已实现同名方法而从未生效。隐藏菜单栏图标后，这是回到设置面板的唯一入口

## v2.3.0

- 新增：设置面板「行为」中新增「显示菜单栏图标」开关，无需借助第三方菜单栏管理工具即可隐藏菜单栏图标——底层的 `app.hideMenubarIcon` 设置本就会实时生效，只是设置界面里一直缺少入口
- 变更：内置补全规则升级至 `@chen86860/autocomplete-specs` 3.1.0，新增 19 个规则（`glab`、`grok`、`herdr`、`hf`、`llama-cli`、`llama-server`、`markitdown`、`mise`、`mkcert`、`ninja`、`protoc`、`swiftlint`、`tesseract`、`whisper-cli`、`xcbeautify`、`xz`、`yq`、`yt-dlp`、`zstd`），并更新 `claude`、`codex`、`copilot` 规则

## v2.2.2

- 修复：Shell 历史建议改为按最近使用倒序排列——历史记录本身是从旧到新读取的，去重时又保留了最早出现的那条，因此输入 `git` 时排在最前面的是很久以前用过的命令，而不是一分钟前刚执行的 `git status`。历史参数值的顺序同样调整

## v2.2.1

- 修复：忽略输入法客户端在窗口已失效后上报的空光标矩形——全零矩形会被解析到屏幕原点，把补全浮层钉在主显示器角落，多显示器环境下就表现为浮层跑到了终端所在屏幕之外的另一块屏上
- 修复：在 VS Code、Cursor、Windsurf 等 Electron 终端中，窗口内焦点转移时隐藏补全浮层——点击编辑器、侧边栏、其他终端面板或关闭终端标签页既不改变焦点窗口也不切换应用，此前浮层会一直停留在屏幕上直到其他事件将其隐藏
- 修复：焦点移动时清除缓存的终端光标元素，浮层不会再锚定在用户刚离开的那个面板上
- 修复：辅助功能权限改为每次启动都检查，而非每个版本只检查一次——覆盖安装同一版本会使授权失效，但系统设置里的勾选仍然保留，此前应用会毫无提示地失效
- 新增：辅助功能权限缺失时在菜单栏显示警告与修复入口（静默启动时这是唯一能触达用户的界面），并在授权变更后立即刷新

## v2.2.0

- 修复：请求尺寸未变化时不再重设补全窗口大小，隐藏时也不再把窗口缩到 1x1——这两种操作都会让 WKWebView 重建底层图形表面，导致内存随每次按键和每次显示/隐藏持续增长
- 修复：补全 WebView 存活过久或累计过多次尺寸变化后，会在隐藏时重建一次以释放 WebKit 保留的图形表面，并移除它所取代的固定 24 小时页面刷新
- 变更：项目改为仅采用 MIT 许可证，应用包内随附 `LICENSE`、`NOTICE` 和自动生成的 `THIRD_PARTY_NOTICES.txt`，并在发布构建中校验这些文件
- 新增：设置面板「关于」中新增「开源许可证」入口，可直接打开应用内附带的许可证文件
- 变更：恢复 AppKit 原生的红绿灯按钮位置，并围绕它重新对齐设置面板侧边栏，导航行更紧凑、分组标题更贴近 macOS 风格
- 构建：升级 React 至 19、zustand 至 5、ESLint 至 10、Protobuf 工具链至 Buf 2.13 / Prost 0.14，以及其余 Rust 与 TypeScript 依赖
- 文档：新增文档中心，补充 Ghostty、Otty、kitty、WezTerm、Alacritty、Zed、iTerm2 的终端配置指南，并提供官网主要页面的简体中文版本
- 变更：隐私政策迁移至 `/privacy-policy`（旧地址会自动跳转），为每个页面设置独立的 sitemap `lastmod`，并为已翻译页面声明 hreflang

## v2.1.1

- 修复：历史记录模式保持默认值时，补全列表重新显示 Shell 历史——此前设置面板显示为「与补全建议一起显示」，但该设置从未真正写入，而代码把未设置当作关闭处理
- 修复：`Process.run` 不再发送空的终端会话 ID，此前它以 `Some("")` 抵达宿主端导致 UUID 解析失败，使 zsh、bash、fish 三个历史来源在每次启动时都静默加载失败
- 修复：改为从编辑缓冲区上下文推断当前 Shell，不再依赖仅在命令执行前触发的 `processDidChange` 通知，因此会话中执行首条命令之前也能使用历史
- 修复：历史来源加载完成后主动重算建议，不再需要等到下次按键或修改设置才显示历史
- 修复：对应 Shell 的历史来源不可用时回退到本地历史数据库，与历史参数建议的既有行为保持一致
- 变更：历史建议图标由 emoji 改为圆角色块内的回转时钟，与列表中其他建议的图标风格统一
- 变更：「隐藏立即执行」改为正向的「显示立即执行」开关，打开时展开子选项而不是收起
- 变更：子设置项改用 macOS 系统设置的缩进内嵌分组样式，并移除只是复述标题的描述文字
- 变更：将设置界面配色抽象为语义化 CSS 变量，使浅色与深色模式保持同步

## v2.1.0

- 变更：桌面端未运行时完全停用 Shell 集成，让 VS Code Terminal Suggest、Otty 等终端保留各自的补全。该判断在 Shell 启动时做出，因此在应用启动前打开的终端本次会话不会被接管——启动 Easy Complete 后新开一个终端即可
- 修复：修正 Release 构建中 macOS 辅助功能事件的订阅方式，此前的未定义行为会让所有订阅都报告失败，导致浮层无法跟随焦点窗口
- 修复：某个辅助功能事件被拒绝时继续跟踪该窗口，而不是放弃整个应用的监听
- 修复：不再监听 Easy Complete 自身窗口，此前这会让浮层的显示被误判为切换应用并立即隐藏
- 修复：恢复首 token 命令补全，从登录 Shell 读取别名与完整 PATH，限时 1.5 秒并在失败时自动回退到非登录方式
- 修复：`Process.run` 的超时时间在转换为 protobuf `Duration` 时使用正确的毫秒到纳秒换算系数
- 修复：安装到 `/Applications` 时保留框架符号链接，使应用包通过 `codesign --verify --deep --strict` 校验，Sparkle 更新器保持有效
- 功能：新增 Otty 与 ChatGPT（Codex）终端支持，包括 Otty 的输入法光标跟踪与 Codex 的 xterm.js 光标定位
- 功能：兼容由 Otty 管理的 Shell rc 文件，当 Otty 占据文件末尾时不再将集成状态误报为损坏
- 功能：新增静默启动设置，应用在后台启动而不打开设置窗口
- 功能：将「立即执行」行改为父级开关，并提供尾随空格与危险命令两个子选项，同时新增首 token 补全开关
- 功能：补全浮层与设置窗口改为按需创建、空闲释放，`autocomplete.keepReady` 的修改无需重启即可生效
- 功能：设置界面支持简体中文与英文，并新增 Claude Light 补全主题
- 修复：阻止危险命令通过当前 token 的兜底路径进入「立即执行」行
- 变更：Release 构建关闭补全 WebView 的 DevTools，并停用 macOS AutoFill 辅助进程
- 构建：装配应用包时遵循 `CARGO_TARGET_DIR` 设置
- 修复：修补两个 lockfile 中已公开的 npm 安全告警，并将独立的 website 项目纳入 Dependabot 覆盖范围

## v2.0.50

- 修复：在清理 appcast 前先规范化 Sparkle 生成的含空格 delta 文件名，并在 delta 资产缺失或不匹配时让发布失败
- 变更：精简 `ec` 命令界面，移除废弃的 `setup` 与 `theme` 命令，隐藏内部命令，并在帮助信息中展示版本与项目地址
- 修复：`ec issue` 改用 GitHub 标准标题/正文链接，`ec update` 接入原生 Sparkle 更新器，Shell 集成安装改用受支持的 integrations 命令
- 构建：将已损坏的 pnpm 11.13.0 固定版本替换为 pnpm 11.14.0，恢复本地与发布构建

## v2.0.49

- 功能：新增官方 `chen86860/homebrew-tap` Cask，Easy Complete 现在可以通过一条 Homebrew 命令安装
- 文档：在中英文 README 与网站中将 Homebrew 设为推荐安装方式，同时保留已签名 DMG 作为手动安装选项

## v2.0.48

- 修复：Sparkle appcast 仅保留当前版本条目及其引用的 delta 文件，避免旧更新条目指向新版本未上传的资产
- 变更：设置窗口在生产构建中禁用浏览器右键菜单、检查元素和界面文字选择，同时保留可编辑控件的文字选择能力，并在本地调试构建中完整开放检查器

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
