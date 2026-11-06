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
      stroke="currentColor"
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

export function IconDocument() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 1.5h5L12.5 5v9.5h-9z" />
      <path d="M8.5 1.5V5h4M5.5 8h5M5.5 10.5h5" />
    </svg>
  );
}

export function IconCopy({ size = 14 }: { size?: number }) {
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
      <rect x="5" y="3.5" width="7.5" height="9" rx="1.6" />
      <path d="M3.5 10.5H3A1.5 1.5 0 0 1 1.5 9V4A1.5 1.5 0 0 1 3 2.5H8" />
    </svg>
  );
}

export function IconUpdate({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
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

export function IconGear({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M13.44 6.67 L15.12 6.92 L15.12 9.08 L13.44 9.33 L12.79 10.91 L13.79 12.27 L12.27 13.79 L10.91 12.79 L9.33 13.44 L9.08 15.12 L6.92 15.12 L6.67 13.44 L5.09 12.79 L3.73 13.79 L2.21 12.27 L3.21 10.91 L2.56 9.33 L0.88 9.08 L0.88 6.92 L2.56 6.67 L3.21 5.09 L2.21 3.73 L3.73 2.21 L5.09 3.21 L6.67 2.56 L6.92 0.88 L9.08 0.88 L9.33 2.56 L10.91 3.21 L12.27 2.21 L13.79 3.73 L12.79 5.09Z M8 5.6a2.4 2.4 0 1 0 0 4.8a2.4 2.4 0 1 0 0-4.8Z"
      />
    </svg>
  );
}

/** A prompt with a column of suggestions: terminal completion. */
export function IconCompletion({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4.5 4.75 7 2 9.5" />
      <path d="M7.5 4h6M7.5 8h4.5M7.5 12h3" />
    </svg>
  );
}

/** Half-filled circle, the System Settings mark for appearance. */
export function IconContrast({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2.4a5.6 5.6 0 0 0 0 11.2Z" fill="currentColor" />
    </svg>
  );
}
