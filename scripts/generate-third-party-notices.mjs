#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const checkIndex = args.indexOf("--check");
const outputPath = resolve(
  repoDir,
  checkIndex === -1
    ? (args[0] ?? "THIRD_PARTY_NOTICES.txt")
    : (args[checkIndex + 1] ?? "THIRD_PARTY_NOTICES.txt"),
);

const runtimeRoots = new Set([
  "ec_cli",
  "fig_desktop",
  "fig_input_method",
  "figterm",
]);
const localThirdPartyCrates = new Set([
  "accessibility",
  "accessibility-sys",
  "alacritty_terminal",
]);
const licenseNamePattern = /^(?:licen[cs]e|copying|notice|copyright)(?:[._-].*)?$/i;
const mitLicenseTerms = `MIT License

Copyright is held by the component's authors and contributors identified above
and in the linked source repository.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
const protobufGoogleBsdNotice = `Copyright 2008 Google Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of Google Inc. nor the names of its contributors may be used
  to endorse or promote products derived from this software without specific
  prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`;

function command(commandName, commandArgs, options = {}) {
  return execFileSync(commandName, commandArgs, {
    cwd: repoDir,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    ...options,
  });
}

function findLicenseFiles(packageDir, explicitLicenseFile) {
  const files = new Set();

  if (explicitLicenseFile) {
    const explicitPath = resolve(packageDir, explicitLicenseFile);
    if (existsSync(explicitPath) && statSync(explicitPath).isFile()) {
      files.add(realpathSync(explicitPath));
    }
  }

  for (const entry of readdirSync(packageDir, { withFileTypes: true })) {
    const entryPath = join(packageDir, entry.name);
    if (entry.isFile() && licenseNamePattern.test(entry.name)) {
      files.add(realpathSync(entryPath));
    } else if (entry.isSymbolicLink() && licenseNamePattern.test(entry.name)) {
      const realPath = realpathSync(entryPath);
      if (statSync(realPath).isFile()) files.add(realPath);
    } else if (entry.isDirectory() && /^licenses?$/i.test(entry.name)) {
      for (const child of readdirSync(entryPath, { withFileTypes: true })) {
        if (child.isFile()) files.add(realpathSync(join(entryPath, child.name)));
      }
    }
  }

  return [...files].sort();
}

function componentFromPackage(packageDir, overrides = {}) {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  return {
    name: overrides.name ?? manifest.name,
    version: overrides.version ?? manifest.version ?? "unknown",
    license: overrides.license ?? manifest.license ?? "Not declared",
    authors: overrides.authors ?? manifest.author ?? manifest.contributors,
    source:
      overrides.source ??
      (typeof manifest.repository === "string"
        ? manifest.repository
        : manifest.repository?.url) ??
      manifest.homepage,
    files: findLicenseFiles(packageDir, manifest.licenseFile ?? manifest.license_file),
  };
}

function rustComponents() {
  const metadata = JSON.parse(
    command("cargo", [
      "metadata",
      "--locked",
      "--format-version",
      "1",
      "--filter-platform",
      "aarch64-apple-darwin",
    ]),
  );
  const packages = new Map(metadata.packages.map((pkg) => [pkg.id, pkg]));
  const nodes = new Map(metadata.resolve.nodes.map((node) => [node.id, node]));
  const queue = metadata.packages
    .filter((pkg) => runtimeRoots.has(pkg.name))
    .map((pkg) => pkg.id);
  const visited = new Set();

  while (queue.length > 0) {
    const id = queue.pop();
    if (!id || visited.has(id)) continue;
    visited.add(id);

    for (const dependency of nodes.get(id)?.deps ?? []) {
      const isRuntimeDependency =
        dependency.dep_kinds.length === 0 ||
        dependency.dep_kinds.some(({ kind }) => kind === null);
      if (isRuntimeDependency) queue.push(dependency.pkg);
    }
  }

  return [...visited]
    .map((id) => packages.get(id))
    .filter(
      (pkg) =>
        pkg && (pkg.source !== null || localThirdPartyCrates.has(pkg.name)),
    )
    .map((pkg) => {
      const packageDir = dirname(pkg.manifest_path);
      const files = findLicenseFiles(packageDir, pkg.license_file);
      if (/^accessibility(?:-sys)?$/.test(pkg.name)) {
        files.push(
          join(
            repoDir,
            "crates/macos-utils/accessibility-master/LICENSE-MIT",
          ),
        );
      }
      return {
        name: pkg.name,
        version: pkg.version,
        license: pkg.license ?? "Not declared",
        authors: pkg.authors,
        source: pkg.repository ?? pkg.homepage ?? pkg.source,
        files: [...new Set(files)].sort(),
      };
    });
}

function javascriptComponents() {
  const grouped = JSON.parse(command("pnpm", ["licenses", "list", "--prod", "--json"]));
  const components = [];

  for (const entries of Object.values(grouped)) {
    for (const entry of entries) {
      for (const packagePath of entry.paths ?? []) {
        components.push(componentFromPackage(realpathSync(packagePath)));
      }
    }
  }

  const bundledSpecsPath = realpathSync(
    join(repoDir, "node_modules/@chen86860/autocomplete-specs"),
  );
  components.push(
    componentFromPackage(bundledSpecsPath, {
      license: "MIT (license file; package metadata declares ISC)",
    }),
  );
  components.push(componentFromPackage(join(repoDir, "packages/fuzzysort")));

  return components;
}

function sparkleComponent() {
  const sparkleRoot = join(repoDir, "build/sparkle");
  const archives = existsSync(sparkleRoot)
    ? readdirSync(sparkleRoot)
        .flatMap((version) => {
          const versionDir = join(sparkleRoot, version);
          if (!lstatSync(versionDir).isDirectory()) return [];
          return readdirSync(versionDir)
            .filter((name) => /^Sparkle-.*\.tar\.xz$/.test(name))
            .map((name) => join(versionDir, name));
        })
        .sort()
    : [];
  const archive = process.env.SPARKLE_ARCHIVE ?? archives.at(-1);
  if (!archive || !existsSync(archive)) {
    throw new Error(
      "Sparkle archive not found. Run scripts/fetch-sparkle.sh before generating notices.",
    );
  }

  const match = /Sparkle-(.+)\.tar\.xz$/.exec(archive);
  return {
    name: "Sparkle",
    version: match?.[1] ?? "unknown",
    license: "MIT and bundled third-party licenses",
    source: "https://github.com/sparkle-project/Sparkle",
    inlineFiles: [
      {
        name: "LICENSE",
        content: command("tar", ["-xOf", archive, "./LICENSE"]),
      },
    ],
  };
}

function addFallbackLicense(component) {
  if (
    (component.files?.length ?? 0) > 0 ||
    (component.inlineFiles?.length ?? 0) > 0
  ) {
    return component;
  }

  if (component.name === "@bufbuild/protobuf") {
    return {
      ...component,
      inlineFiles: [
        {
          name: "LICENSE-APACHE-2.0",
          content: readFileSync(
            join(repoDir, "crates/alacritty_terminal/LICENSE-APACHE"),
            "utf8",
          ),
        },
        { name: "LICENSE-BSD-3-Clause", content: protobufGoogleBsdNotice },
      ],
    };
  }

  if (/MIT/.test(component.license)) {
    return {
      ...component,
      inlineFiles: [{ name: "LICENSE-MIT", content: mitLicenseTerms }],
    };
  }

  if (/Apache-2\.0/.test(component.license)) {
    return {
      ...component,
      inlineFiles: [
        {
          name: "LICENSE-APACHE-2.0",
          content: readFileSync(
            join(repoDir, "crates/alacritty_terminal/LICENSE-APACHE"),
            "utf8",
          ),
        },
      ],
    };
  }

  return component;
}

function displayAuthors(authors) {
  if (!authors) return undefined;
  if (typeof authors === "string") return authors;
  if (Array.isArray(authors)) {
    return authors
      .map((author) =>
        typeof author === "string" ? author : author.name ?? JSON.stringify(author),
      )
      .join(", ");
  }
  return authors.name ?? JSON.stringify(authors);
}

function renderComponent(component) {
  const fileEntries = [
    ...(component.files ?? []).map((filePath) => ({
      name: basename(filePath),
      content: readFileSync(filePath, "utf8"),
    })),
    ...(component.inlineFiles ?? []),
  ];
  const lines = [
    "=".repeat(80),
    `${component.name} ${component.version}`,
    `License: ${component.license}`,
  ];
  const authors = displayAuthors(component.authors);
  if (authors) lines.push(`Authors: ${authors}`);
  if (component.source) lines.push(`Source: ${component.source}`);

  if (fileEntries.length === 0) {
    lines.push(
      "",
      "No standalone license file was included in the package; the license",
      "expression above is taken from its package metadata.",
    );
  } else {
    for (const file of fileEntries) {
      lines.push("", `--- ${file.name} ---`, "", file.content.trim());
    }
  }

  return `${lines.join("\n")}\n`;
}

const components = [
  sparkleComponent(),
  ...rustComponents(),
  ...javascriptComponents(),
]
  .map(addFallbackLicense)
  .sort((left, right) =>
  `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`),
  );

const uniqueComponents = [];
const seen = new Set();
for (const component of components) {
  const key = `${component.name}@${component.version}`;
  if (seen.has(key)) continue;
  seen.add(key);
  uniqueComponents.push(component);
}

const missingLicenses = uniqueComponents.filter(
  (component) =>
    (component.files?.length ?? 0) === 0 &&
    (component.inlineFiles?.length ?? 0) === 0,
);
if (missingLicenses.length > 0) {
  const missing = missingLicenses
    .map((component) => `${component.name}@${component.version}`)
    .join(", ");
  throw new Error(`Dependency packages missing license files: ${missing}`);
}

const output = [
  "Easy Complete Third-Party Notices",
  "",
  "This file contains copyright and license notices for third-party software",
  "distributed with Easy Complete. It is generated by",
  "scripts/generate-third-party-notices.mjs; do not edit it manually.",
  "",
  ...uniqueComponents.map(renderComponent),
].join("\n");

if (checkIndex !== -1) {
  if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== output) {
    console.error(
      `${relative(repoDir, outputPath)} is stale. Run: node scripts/generate-third-party-notices.mjs`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(outputPath, output);
  console.log(
    `Wrote ${relative(repoDir, outputPath)} with ${uniqueComponents.length} components.`,
  );
}
