# LaHIM Frontend

Staff-facing React application for LaHIM.

## Overview

This package contains the main operational UI for LaHIM, including patient workflows, laboratory operations, reporting, inventory, scheduling, and settings. The active frontend direction is React 18 + Vite + TypeScript + TanStack Query, with `@lahim/components` as the primary UI package.

## Development

```bash
yarn install
yarn start
```

Useful commands:

```bash
yarn dev
yarn build
yarn test:ci
yarn lint
```

## Notes

- This package is part of the LaHIM workspace.
- New UI work should prefer `@lahim/components`.
- Legacy compatibility code may remain during migration, but the intended identity and ownership are fully LaHIM.

## License

Released under the [MIT license](LICENSE).
