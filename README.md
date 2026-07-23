# Ayphr Server

[![CodeQL Advanced](https://github.com/ayphr/server/actions/workflows/codeql.yml/badge.svg)](https://github.com/ayphr/server/actions/workflows/codeql.yml)

Backend service for Ayphr, built with TypeScript and Bun.

## Prerequisites

- Bun 1.0+

## Getting Started

Install dependencies:

```bash
bun install
```

Run the server:

```bash
bun run src/index.ts
```

Or use the package script:

```bash
bun run start
```

## Project Structure

- `src/index.ts`: Main server entry point
- `src/dbWorker.ts`: Database worker logic
- `src/worker.ts`: Worker runtime logic
- `src/workers/`: Worker-specific modules
- `src/lib/`: Shared server utilities
- `src/testClient.ts`: Local test client
