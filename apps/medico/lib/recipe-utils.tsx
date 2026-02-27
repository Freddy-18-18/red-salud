/**
 * @file recipe-utils.tsx
 * @description Barrel re-export for recipe utilities.
 * Individual modules:
 *   - recetas/recipe-data.ts: Data construction (constructRecipeData, constructRecipeSettings)
 *   - recetas/recipe-html.tsx: HTML generation (generateRecipeHtml)
 *   - recetas/recipe-pdf.ts: PDF generation (downloadRecipePdf)
 */

export { constructRecipeData, constructRecipeSettings } from "./recetas/recipe-data";
export type { RecipeInput } from "./recetas/recipe-data";
export { generateRecipeHtml } from "./recetas/recipe-html";
export { downloadRecipePdf } from "./recetas/recipe-pdf";
