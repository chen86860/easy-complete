export function IconAppearance({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12.5 L9.5 5 L11 3.5 L12.5 5 L11 6.5 L3.5 14" />
      <path d="M9.5 5 L11 6.5" />
      <circle cx="2.8" cy="13.2" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBehavior({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <line x1="3" y1="4.5" x2="13" y2="4.5" />
      <circle cx="6.5" cy="4.5" r="1.8" fill="currentColor" stroke="none" />
      <line x1="3" y1="8" x2="13" y2="8" />
      <circle cx="10" cy="8" r="1.8" fill="currentColor" stroke="none" />
      <line x1="3" y1="11.5" x2="13" y2="11.5" />
      <circle cx="6" cy="11.5" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconHistory({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5.5V8L9.8 9.8" />
    </svg>
  );
}

export function IconAdvanced({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" />
    </svg>
  );
}

export function IconAbout({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 7.5V11" />
      <circle cx="8" cy="5.2" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5 8l2.2 2.2L11 5.5" />
    </svg>
  );
}

export function IconWarning() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 1.5L14.5 13H1.5L8 1.5Z" />
      <path d="M8 6.5V9.5" />
      <circle cx="8" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconExternalLink() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#8e8e93"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
      <path d="M10 2h4v4" />
      <path d="M14 2L8 8" />
    </svg>
  );
}

export function IconUpdate({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.5 2.5A6.5 6.5 0 0 0 2.5 8" />
      <path d="M2.5 13.5A6.5 6.5 0 0 0 13.5 8" />
      <path d="M11 1l2.5 1.5L12 5" />
      <path d="M5 15l-2.5-1.5L4 11" />
    </svg>
  );
}

export function IconGitHub() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
