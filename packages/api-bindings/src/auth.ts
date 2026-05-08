// AWS auth bindings stubbed out — not used in autocomplete-v5

export function status(): Promise<{
  authed: boolean;
  authKind: "BuilderId" | "IamIdentityCenter" | undefined;
  startUrl: string;
  region: string;
}> {
  return Promise.resolve({
    authed: false,
    authKind: undefined,
    startUrl: "",
    region: "",
  });
}

export function startPkceAuthorization(_opts?: {
  region?: string;
  issuerUrl?: string;
}): Promise<Record<string, never>> {
  return Promise.resolve({});
}

export function finishPkceAuthorization(_opts: {
  authRequestId?: string;
}): Promise<Record<string, never>> {
  return Promise.resolve({});
}

export function cancelPkceAuthorization(): Promise<Record<string, never>> {
  return Promise.resolve({});
}

export function builderIdStartDeviceAuthorization(_opts?: {
  region?: string;
  startUrl?: string;
}): Promise<{ authRequestId: string; expiresIn: number; interval: number }> {
  return Promise.resolve({ authRequestId: "", expiresIn: 0, interval: 0 });
}

export async function builderIdPollCreateToken(_opts: {
  authRequestId: string;
  expiresIn: number;
  interval: number;
}): Promise<void> {
  // no-op
}
