import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "dist/**",
        "node_modules/**"
    ]),
    {
        files: ["**/*.{ts,tsx}"],
        rules: {
            // Allow relative imports in UI package or customize as needed
            "no-restricted-imports": "off",
            // UI package specific overrides can go here
            "@typescript-eslint/no-empty-object-type": "off",
            "@next/next/no-html-link-for-pages": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_"
                }
            ]
        },
    },
]);

export default eslintConfig;
