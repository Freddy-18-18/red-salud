# Red Salud Monorepo

Red Salud web and desktop application monorepo.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run web development server
pnpm dev

# Run desktop development server (Pharmacy)
pnpm tauri:dev
```

## Features

- **Web Application**: Next.js based web interface.
- **Desktop Application (Medical)**: Tauri based desktop app for doctors.
- **Desktop Application (Pharmacy)**: Tauri based desktop app for pharmacy.

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API Endpoint URL | - |

## Documentation

- [API Reference](./docs/api.md)
- [Architecture](./docs/architecture.md)
- [Development Guide](./docs/development.md)
- [Periodontograma Implementation](./docs/PERIODONTOGRAMA-RESUMEN.md)

## License

MIT
