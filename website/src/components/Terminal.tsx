import { useEffect, useMemo, useRef, useState } from "react";

type ItemKind = "sub" | "flag" | "arg" | "val";

interface MenuItem {
  t: ItemKind;
  name: string;
  desc: string;
}

type KeyName = "" | "up" | "down" | "tab" | "esc";

interface Frame {
  cmd: string;
  ghost: string;
  menu: MenuItem[];
  sel: number;
  key: KeyName;
  ms: number;
}

const badgeColor: Record<ItemKind, string> = {
  sub: "var(--accent)",
  flag: "#58a6ff",
  arg: "#bc8cff",
  val: "#e3b341",
};

/** Builds the keystroke-by-keystroke demo timeline (ported from the design's build()). */
function buildTimeline(): { frames: Frame[]; restIndex: number } {
  const F: Frame[] = [];
  let restIndex = 0;

  const type = (acc: string, text: string): string => {
    for (const ch of text) {
      acc += ch;
      F.push({
        cmd: acc,
        ghost: "",
        menu: [],
        sel: -1,
        key: "",
        ms: ch === " " ? 150 : 78,
      });
    }
    return acc;
  };

  const gitMenu: MenuItem[] = [
    { t: "sub", name: "status", desc: "Show the working tree status" },
    { t: "sub", name: "commit", desc: "Record changes to the repository" },
    { t: "sub", name: "checkout", desc: "Switch branches or restore files" },
    { t: "sub", name: "push", desc: "Update remote refs and objects" },
  ];
  const gitFlags: MenuItem[] = [
    { t: "flag", name: "-m", desc: "Use the given commit message" },
    { t: "flag", name: "-a", desc: "Stage all modified & deleted files" },
    { t: "flag", name: "--amend", desc: "Replace the tip of the branch" },
  ];
  const dockerMenu: MenuItem[] = [
    { t: "sub", name: "run", desc: "Create and run a new container" },
    { t: "sub", name: "build", desc: "Build an image from a Dockerfile" },
    { t: "sub", name: "compose", desc: "Run multi-container apps" },
    { t: "sub", name: "ps", desc: "List containers" },
  ];
  const runFlags: MenuItem[] = [
    { t: "flag", name: "-p", desc: "Publish a port to the host" },
    { t: "flag", name: "-d", desc: "Run in the background" },
    { t: "flag", name: "-it", desc: "Interactive + TTY" },
  ];
  const npmMenu: MenuItem[] = [
    { t: "sub", name: "install", desc: "Install a package" },
    { t: "sub", name: "run", desc: "Run a package script" },
    { t: "sub", name: "init", desc: "Create a package.json" },
  ];
  const npmScripts: MenuItem[] = [
    { t: "val", name: "build", desc: "package.json script" },
    { t: "val", name: "dev", desc: "package.json script" },
    { t: "val", name: "test", desc: "package.json script" },
  ];

  // git
  type("", "git ");
  F.push({
    cmd: "git ",
    ghost: "status",
    menu: gitMenu,
    sel: 0,
    key: "",
    ms: 760,
  });
  restIndex = F.length - 1;
  F.push({
    cmd: "git ",
    ghost: "commit",
    menu: gitMenu,
    sel: 1,
    key: "down",
    ms: 700,
  });
  F.push({
    cmd: "git commit ",
    ghost: "",
    menu: [],
    sel: -1,
    key: "tab",
    ms: 300,
  });
  F.push({
    cmd: "git commit ",
    ghost: "-m",
    menu: gitFlags,
    sel: 0,
    key: "",
    ms: 720,
  });
  F.push({
    cmd: "git commit -m ",
    ghost: '"fix: handle empty input"',
    menu: [],
    sel: -1,
    key: "tab",
    ms: 1250,
  });
  F.push({
    cmd: 'git commit -m "fix: handle empty input"',
    ghost: "",
    menu: [],
    sel: -1,
    key: "",
    ms: 900,
  });
  F.push({ cmd: "", ghost: "", menu: [], sel: -1, key: "esc", ms: 360 });

  // docker
  type("", "docker ");
  F.push({
    cmd: "docker ",
    ghost: "run",
    menu: dockerMenu,
    sel: 0,
    key: "",
    ms: 760,
  });
  F.push({
    cmd: "docker run ",
    ghost: "-p",
    menu: runFlags,
    sel: 0,
    key: "tab",
    ms: 720,
  });
  F.push({
    cmd: "docker run -p ",
    ghost: "8080:80",
    menu: [],
    sel: -1,
    key: "tab",
    ms: 880,
  });
  F.push({
    cmd: "docker run -p 8080:80 ",
    ghost: "nginx",
    menu: [],
    sel: -1,
    key: "",
    ms: 860,
  });
  F.push({
    cmd: "docker run -p 8080:80 nginx",
    ghost: "",
    menu: [],
    sel: -1,
    key: "",
    ms: 900,
  });
  F.push({ cmd: "", ghost: "", menu: [], sel: -1, key: "esc", ms: 360 });

  // npm
  type("", "npm ");
  F.push({
    cmd: "npm ",
    ghost: "install",
    menu: npmMenu,
    sel: 0,
    key: "",
    ms: 740,
  });
  F.push({
    cmd: "npm ",
    ghost: "run",
    menu: npmMenu,
    sel: 1,
    key: "down",
    ms: 660,
  });
  F.push({
    cmd: "npm run ",
    ghost: "build",
    menu: npmScripts,
    sel: 0,
    key: "tab",
    ms: 760,
  });
  F.push({
    cmd: "npm run build",
    ghost: "",
    menu: [],
    sel: -1,
    key: "tab",
    ms: 1050,
  });
  F.push({ cmd: "", ghost: "", menu: [], sel: -1, key: "esc", ms: 420 });

  return { frames: F, restIndex };
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

interface TerminalProps {
  showKeys?: boolean;
  demoSpeed?: number;
}

export function Terminal({ showKeys = true, demoSpeed = 1 }: TerminalProps) {
  const { frames, restIndex } = useMemo(buildTimeline, []);
  const reduceMotion = useMemo(prefersReducedMotion, []);
  const [f, setF] = useState(() => (reduceMotion ? restIndex : 0));
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (reduceMotion) return;
    const speed = Math.max(0.4, Math.min(2.2, Number(demoSpeed) || 1));
    const cur = frames[f] ?? frames[0];
    const ms = Math.round(cur.ms / speed);
    timer.current = window.setTimeout(() => {
      setF((s) => (s + 1) % frames.length);
    }, ms);
    return () => window.clearTimeout(timer.current);
  }, [f, frames, demoSpeed, reduceMotion]);

  const frame = frames[f] ?? frames[0];
  const cap = (active: boolean) =>
    [
      "inline-flex items-center justify-center min-w-[30px] h-[27px] px-[9px]",
      "rounded-[7px] border font-mono text-xs transition-all duration-150",
      active
        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_0_1px_var(--accent),0_0_14px_var(--accent-glow)]"
        : "border-[#2a333e] bg-[#10161f] text-[#8b95a1]",
    ].join(" ");

  return (
    <div className="w-full font-mono">
      <div className="w-full overflow-hidden rounded-[13px] border border-[#222a35] bg-[#0b0f15] shadow-[0_30px_70px_-28px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.02)]">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-[#1d2530] bg-[#10161f] px-[14px] py-[11px]">
          <span className="h-[11px] w-[11px] flex-none rounded-full bg-[#ff5f57]" />
          <span className="h-[11px] w-[11px] flex-none rounded-full bg-[#febc2e]" />
          <span className="h-[11px] w-[11px] flex-none rounded-full bg-[#28c840]" />
          <span className="flex-1 text-center text-xs tracking-[.02em] text-[#5d6773]">
            ec — zsh — 80×24
          </span>
          <span className="inline-flex items-center gap-[5px] text-[11px] text-[var(--accent)]">
            <span className="h-[6px] w-[6px] rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            live
          </span>
        </div>

        {/* Screen */}
        <div className="relative h-[248px] overflow-hidden px-[18px] pb-[20px] pt-[18px] text-sm leading-[1.7]">
          <div className="flex flex-wrap items-center whitespace-pre">
            <span className="mr-[9px] text-[#586471]">~/web-app</span>
            <span className="mr-[9px] font-bold text-[var(--accent)]">❯</span>
            <span className="text-[#eaf0f6]">{frame.cmd}</span>
            {frame.ghost && (
              <span className="text-[#586471]">{frame.ghost}</span>
            )}
            <span className="ec-blink ml-[2px] inline-block h-[17px] w-[8px] rounded-[1px] bg-[var(--accent)]" />
          </div>

          {frame.menu.length > 0 && (
            <div className="ec-pop absolute left-[18px] top-[52px] w-[calc(100%-36px)] overflow-hidden rounded-[11px] border border-[#2a323d] bg-[#0e141d] shadow-[0_22px_48px_-14px_rgba(0,0,0,.85)] sm:left-[96px] sm:w-max sm:max-w-[84%]">
              {frame.menu.map((m, i) => {
                const selected = i === frame.sel;
                return (
                  <div
                    key={m.name}
                    className={`flex min-w-0 items-center gap-[10px] px-[13px] py-2 ${
                      selected
                        ? "bg-[var(--accent-soft)] shadow-[inset_2px_0_0_var(--accent)]"
                        : ""
                    }`}
                  >
                    <span
                      className="flex-none min-w-[30px] font-mono text-[10px] font-bold uppercase tracking-[.05em]"
                      style={{ color: badgeColor[m.t] }}
                    >
                      {m.t}
                    </span>
                    <span className="min-w-[80px] font-medium text-[#eaf0f6] sm:min-w-[96px]">
                      {m.name}
                    </span>
                    <span className="min-w-0 truncate whitespace-nowrap text-xs text-[#5d6773]">
                      {m.desc}
                    </span>
                  </div>
                );
              })}
              <div className="flex gap-[14px] border-t border-[#1f2630] px-[13px] py-2 text-[11px] text-[#4d5663]">
                ↑↓ navigate · ⇥ accept · esc dismiss
              </div>
            </div>
          )}
        </div>
      </div>

      {showKeys && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className={cap(frame.key === "up")}>↑</span>
          <span className={cap(frame.key === "down")}>↓</span>
          <span className="ml-[2px] mr-2 font-[var(--font-display)] text-xs text-[#5d6773]">
            navigate
          </span>
          <span className={cap(frame.key === "tab")}>⇥</span>
          <span className="ml-[2px] mr-2 font-[var(--font-display)] text-xs text-[#5d6773]">
            accept
          </span>
          <span className={cap(frame.key === "esc")}>esc</span>
          <span className="ml-[2px] font-[var(--font-display)] text-xs text-[#5d6773]">
            dismiss
          </span>
        </div>
      )}
    </div>
  );
}
