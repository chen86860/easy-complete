import { fs as FileSystem } from "@easy-complete/api-bindings";

export const fread = (path: string): Promise<string> =>
  FileSystem.read(path).then((out) => out ?? "");
