import eslint from "@eslint/js";
import tslint from "typescript-eslint";

export default tslint.config(
  {
    ignores: [
      "docs/*",
      "examples/*",
      "packages/*",
      "!packages/jspsych",
      "packages/jspsych/*",
      "!packages/jspsych/src",
    ],
  },
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  }
);
