import { WindowPosition } from "@easy-complete/api-bindings";

export function DashboardWindowChrome() {
  return (
    <>
      <div aria-hidden="true" className="dashboard-top-blur" />

      <div
        aria-hidden="true"
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          void WindowPosition.dragWindow();
        }}
        className="dashboard-window-drag-region"
      />
    </>
  );
}
