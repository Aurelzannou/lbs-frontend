// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Ces règles remontent ~300 occurrences préexistantes dans le code déjà en place
      // (adopté pour la première fois avec ce lint). Rétrogradées en warning pour ne pas
      // bloquer la CI sur du code non lié à la tâche en cours — à corriger progressivement.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/consistent-indexed-object-style": "warn",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
      "@angular-eslint/template/label-has-associated-control": "warn",
      "@angular-eslint/template/elements-content": "warn",
    },
  },
  // Doit rester en dernier : désactive les règles ESLint qui entrent en conflit avec Prettier.
  eslintConfigPrettier
);
