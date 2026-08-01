// @ts-check

import tseslint from "typescript-eslint";
import { CONFIG } from "./common.js";
// @ts-ignore
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import type { TSESLint } from "@typescript-eslint/utils";

const config = ({
  tsconfigPath,
}: {
  tsconfigPath: string;
}): TSESLint.FlatConfig.ConfigArray =>
  tseslint.config(
    ...CONFIG,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.recommended,
    {
      languageOptions: {
        parserOptions: {
          project: tsconfigPath,
        },
      },
      ignores: ["*.config.{js,ts}"],
    },
  );

export default config;
