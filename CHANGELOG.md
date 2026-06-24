# Changelog

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
