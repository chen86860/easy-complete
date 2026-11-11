#!/usr/bin/env node
import { readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const buildDir = resolve("build");

async function walkJsFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkJsFiles(fullPath)));
    } else if (entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function specNames(name) {
  return Array.isArray(name) ? name : [name];
}

async function importSpec(file) {
  return import(pathToFileURL(file).href);
}

function assertPnpmRecursive(module) {
  const spec = module.default;
  const recursive = spec?.subcommands?.find((subcommand) =>
    specNames(subcommand.name).includes("recursive"),
  );

  if (!recursive) {
    throw new Error("pnpm spec is missing the recursive subcommand");
  }

  if (
    !Array.isArray(recursive.subcommands) ||
    recursive.subcommands.length === 0
  ) {
    throw new Error("pnpm recursive subcommand has no nested subcommands");
  }
}

const files = await walkJsFiles(buildDir);
const failures = [];

for (const file of files) {
  try {
    const module = await importSpec(file);
    if (relative(buildDir, file) === "pnpm.js") {
      assertPnpmRecursive(module);
    }
  } catch (error) {
    failures.push({
      file: relative(process.cwd(), file),
      error,
    });
  }
}

if (failures.length > 0) {
  console.error(`Built spec smoke test failed for ${failures.length} file(s).`);
  for (const { file, error } of failures.slice(0, 20)) {
    console.error(`\n${file}`);
    console.error(error?.stack || error);
  }
  if (failures.length > 20) {
    console.error(`\n...and ${failures.length - 20} more failure(s).`);
  }
  process.exit(1);
}

console.log(`Imported ${files.length} built spec file(s).`);
