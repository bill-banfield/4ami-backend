# Package Manager - npm

This project uses **npm** as the standard package manager.

## Installation

```bash
npm install
```

## Why npm?

- Consistent with project history
- Better compatibility with existing tooling
- Team familiarity
- Standardized across frontend and backend

## Important

⚠️ **Do not use pnpm or yarn** for this project to avoid lock file conflicts.

Always use:
- `npm install` to install dependencies
- `npm run build` to build
- `npm run start:dev` for development
- `npm test` to run tests

## Lock File

This project uses `package-lock.json` for dependency locking. 
Do not commit `pnpm-lock.yaml` or `yarn.lock` files.
