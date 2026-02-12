# Scripts – apps/web

## Raíz (`scripts/`)

Scripts activos usados en el flujo de desarrollo.

### Referenciados en `package.json`
| Script | Comando | Descripción |
|--------|---------|-------------|
| `scrape-sacs.ts` | `pnpm scrape-sacs` | Scraping de SACS |
| `scrape-sacs-simple.ts` | `pnpm scrape-sacs-simple` | Scraping SACS simplificado |
| `verify-workspace-setup.ts` | `pnpm verify-workspace` | Verificar configuración del workspace |
| `test-email-validation.ts` | `pnpm test-email` | Test de validación de email |
| `test-phone-prefix.ts` | `pnpm test-phone` | Test de prefijos telefónicos |
| `test-consulta-build.ts` | `pnpm test-consulta` | Test de build de consulta |
| `test-hero-usability.ts` | `pnpm test-hero` | Test de usabilidad del hero |
| `index-public-pages.ts` | `pnpm index-public-pages` | Indexar páginas públicas |
| `tauri-build.js` | `pnpm build:tauri` | Build script para Tauri |

### Scripts de verificación (no en package.json pero útiles)
| Script | Descripción |
|--------|-------------|
| `verify-file-sizes.ts` | Detecta archivos que exceden límites recomendados |
| `verify-imports.ts` | Verifica convenciones de imports |
| `verify-routes.ts` | Verifica consistencia de rutas |
| `verify-single-responsibility.ts` | Detecta archivos con múltiples responsabilidades |

### Scripts de datos y sincronización
| Script | Descripción |
|--------|-------------|
| `index-knowledge-base.ts` | Indexar base de conocimiento |
| `ingest-docs.ts` | Ingestar documentación |
| `sync-specialties-to-db.ts` | Sincronizar especialidades a BD |
| `sync-user-roles.ts` | Sincronizar roles de usuario |

## Archivo (`scripts/archive/`)

Scripts de una sola ejecución, migraciones ya aplicadas, seeds de demo y tests puntuales. Se conservan como referencia histórica pero no forman parte del flujo de desarrollo actual.

Incluye: migraciones (`apply-*.ts/sql`), seeds (`seed-*.sql`), setup de demo (`setup-demo-clinic*.sql`), tests SACS (`test-sacs-*.js`), informes (`informe-cedula-*.png`), y utilidades de corrección (`fix-*.ts/sh/bat`).
