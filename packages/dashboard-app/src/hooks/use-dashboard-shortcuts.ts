import { useEffect } from "react";

export function useDashboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "w") {
        event.preventDefault();
        window.close();
        return;
      }

      // Like System Settings, Escape never closes the window. In a text field
      // it cancels the edit: the field goes back to its saved value and gives
      // up focus without committing (fields commit on blur).
      if (event.key === "Escape") {
        const field = document.activeElement;
        if (
          field instanceof HTMLInputElement &&
          (field.type === "text" || field.type === "number")
        ) {
          event.preventDefault();
          field.value = field.defaultValue;
          field.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
