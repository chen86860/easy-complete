import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { describe, expect, it } from "vitest";
import { getVersionFromVersionedSpec } from "../src/versions";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const fixturesPath = path.join(dirname, "fixtures");
const fixtureNames = fs
  .readdirSync(fixturesPath, { withFileTypes: true })
  .filter((file) => file.isDirectory() && file.name !== ".DS_Store")
  .map((file) => file.name);

describe("versioned spec fixtures", () => {
  for (const name of fixtureNames) {
    it(`fixture ${name} matches expected.json`, async () => {
      const fixtureDirPath = path.join(fixturesPath, name);
      const specVersionPath = path.join(fixtureDirPath, "spec", "1.0.0.js");
      const expectedSpecPath = path.join(fixtureDirPath, "expected.json");
      const configPath = path.join(fixtureDirPath, "config.json");

      const { targetVersion } = JSON.parse(fs.readFileSync(configPath, "utf8"));

      const importedModule = await import(specVersionPath);
      const output = getVersionFromVersionedSpec(
        importedModule.completion,
        importedModule.versions,
        targetVersion,
      );

      const expectedSpec = JSON.parse(fs.readFileSync(expectedSpecPath, "utf8"));
      expect(output).toStrictEqual(expectedSpec);
    });
  }
});
