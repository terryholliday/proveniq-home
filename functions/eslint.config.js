
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: { globals: globals.node },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["lib/"],
  }
];
