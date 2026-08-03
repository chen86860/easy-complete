import { createFileRoute } from "@tanstack/react-router";
import {
  GUIDE_CODE,
  GUIDE_HEADING,
  GUIDE_PARAGRAPH,
  GuideCallout,
  GuideList,
  GuidePage,
  RelatedGuides,
} from "../components/GuidePage.tsx";
import { DOWNLOAD_URL } from "../download.ts";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const TITLE = "在 macOS 上安装 Easy Complete — 终端自动补全";
const DESCRIPTION =
  "在 Apple Silicon Mac 上用 Homebrew 安装 Easy Complete,授予辅助功能权限,重载 Shell,并用 ec doctor 验证安装。";

const ALTERNATES = [
  { locale: "en" as const, path: "/install" },
  { locale: "zh-CN" as const, path: "/zh/install" },
];

export const Route = createFileRoute("/zh/install")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/zh/install",
      locale: "zh-CN",
      alternates: ALTERNATES,
    }),
  component: ZhInstallPage,
});

function ZhInstallPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/zh/install",
          crumbLabel: "安装指南",
          locale: "zh-CN",
        })}
      />
      <GuidePage
        eyebrow="安装指南"
        title="五分钟装好终端自动补全。"
        intro="Easy Complete 在 Apple Silicon Mac 上本地运行。装好应用,批准一项 macOS 权限,重载 Shell,然后就可以开始输入了。"
        locale="zh-CN"
        hrefs={{ en: "/install", "zh-CN": "/zh/install" }}
      >
        <GuideCallout>
          <strong>系统要求:</strong>macOS 12 或更高版本,以及 Apple Silicon
          机型(M1 及以上)。发布的 DMG 仅提供 ARM64 版本。
        </GuideCallout>

        <h2 className={GUIDE_HEADING}>1. 用 Homebrew 安装</h2>
        <p className={GUIDE_PARAGRAPH}>
          一条 Homebrew 命令即可安装已签名并公证的应用,Easy Complete 的 tap
          会自动添加:
        </p>
        <pre className={GUIDE_CODE}>
          brew install --cask chen86860/tap/easy-complete
        </pre>
        <p className={GUIDE_PARAGRAPH}>
          想手动安装?下载最新的签名 DMG,打开后把{" "}
          <strong className="text-[#d6dee8]">Easy Complete.app</strong>{" "}
          拖入「应用程序」文件夹即可。
        </p>
        <p className="mb-8">
          <a
            href={DOWNLOAD_URL}
            className="inline-flex rounded-[10px] bg-(--accent) px-5 py-3 font-semibold text-[#06140a] transition hover:brightness-110"
          >
            改为下载 ARM64 版 DMG
          </a>
        </p>

        <h2 className={GUIDE_HEADING}>2. 启动 Easy Complete</h2>
        <GuideList>
          <li>
            从 <code className="font-mono text-[#cdd6e0]">/Applications</code>{" "}
            打开 Easy Complete。
          </li>
          <li>
            首次启动会安装随附的命令行工具、Shell 集成和终端输入法。
          </li>
          <li>
            如果希望开机自启,可以在菜单栏图标里打开「设置」进行配置。
          </li>
        </GuideList>

        <h2 className={GUIDE_HEADING}>3. 授予辅助功能权限</h2>
        <p className={GUIDE_PARAGRAPH}>
          macOS 的辅助功能权限让 Easy Complete
          能把原生建议窗口摆在终端光标旁边。请在这里勾选 Easy Complete:
        </p>
        <pre className={GUIDE_CODE}>系统设置 → 隐私与安全性 → 辅助功能</pre>
        <p className={GUIDE_PARAGRAPH}>如果没有弹出授权提示,可以从终端再次触发:</p>
        <pre className={GUIDE_CODE}>ec debug prompt-accessibility</pre>

        <h2 className={GUIDE_HEADING}>4. 重载 Shell</h2>
        <p className={GUIDE_PARAGRAPH}>
          开一个全新的 Shell 会话,让 zsh、bash 或 fish 加载集成。
        </p>
        <pre className={GUIDE_CODE}>exec $SHELL</pre>

        <h2 className={GUIDE_HEADING}>5. 验证安装</h2>
        <p className={GUIDE_PARAGRAPH}>
          运行内置的 doctor 检查,然后输入一个熟悉的命令,比如{" "}
          <code className="font-mono text-[#cdd6e0]">git</code> 或{" "}
          <code className="font-mono text-[#cdd6e0]">npm</code>
          ,建议应该会出现在光标旁边。
        </p>
        <pre className={GUIDE_CODE}>ec doctor</pre>

        <h2 className={GUIDE_HEADING}>从源码构建</h2>
        <p className={GUIDE_PARAGRAPH}>
          开发者也可以从开源仓库在本地构建出同一个应用:
        </p>
        <pre
          className={GUIDE_CODE}
        >{`git clone https://github.com/chen86860/easy-complete.git
cd easy-complete
./install.sh`}</pre>

        <RelatedGuides
          locale="zh-CN"
          links={[
            {
              href: "/zh/docs",
              label: "全部文档",
              description: "终端支持列表、快速开始与参考资料。",
            },
            {
              href: "/zh/troubleshooting",
              label: "故障排查",
              description: "排查权限、Shell 钩子与终端集成问题。",
            },
          ]}
        />
      </GuidePage>
    </>
  );
}
