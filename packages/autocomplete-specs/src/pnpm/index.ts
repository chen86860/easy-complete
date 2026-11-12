import { createVersionedSpec } from "@fig/autocomplete-helpers";

const versionFiles = ["10.0.0", "11.0.0", "12.0.0"];

export default createVersionedSpec("pnpm", versionFiles);
