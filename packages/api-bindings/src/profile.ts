// AWS profile API bindings stubbed out — not used in autocomplete-v5

export async function listAvailableProfiles(): Promise<{ profiles: never[] }> {
  return { profiles: [] };
}

export async function setProfile(
  _profileName: string,
  _arn: string,
): Promise<void> {
  // no-op
}
