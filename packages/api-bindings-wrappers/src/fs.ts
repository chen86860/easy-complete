import { fs as FileSystem } from "@autocomplete-v5/api-bindings";

export const fread = (path: string): Promise<string> =>
  FileSystem.read(path).then((out) => out ?? "");
