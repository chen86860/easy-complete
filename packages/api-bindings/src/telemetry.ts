// Telemetry bindings stubbed out — not used in autocomplete-v5

type Property = string | boolean | number | null;

export function track(
  _event: string,
  _properties: Record<string, Property>,
): Promise<void> {
  return Promise.resolve();
}

export function page(
  _category: string,
  _name: string,
  _properties: Record<string, Property>,
): Promise<void> {
  return Promise.resolve();
}
