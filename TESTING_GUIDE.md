# Testing Guide for LaHIM Frontend

## Overview

LaHIM frontend uses two testing frameworks:
- **Vitest**: Fast unit and component testing
- **Playwright**: End-to-end (E2E) testing

## Quick Start

### Install Dependencies
```bash
yarn install
```

### Run Tests
```bash
# Unit tests (Vitest)
yarn test              # Watch mode
yarn test:ui           # Interactive UI
yarn test:coverage     # With coverage report

# E2E tests (Playwright)
yarn test:e2e          # Run all E2E tests
yarn test:e2e:ui       # Interactive UI
```

## Vitest (Unit Testing)

### Configuration
- Config file: `vitest.config.ts`
- Setup file: `src/test/setup.ts`
- Test files: `**/*.test.ts` or `**/*.test.tsx`

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Testing Hooks

```typescript
import { renderHook } from '@testing-library/react'
import { useMyHook } from './useMyHook'

it('should return correct value', () => {
  const { result } = renderHook(() => useMyHook())
  expect(result.current).toBe('expected')
})
```

### Mocking

```typescript
import { vi } from 'vitest'

// Mock a module
vi.mock('./api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'test' }))
}))

// Mock a function
const mockFn = vi.fn()
```

## Playwright (E2E Testing)

### Configuration
- Config file: `playwright.config.ts`
- Test files: `e2e/**/*.spec.ts`

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to patients page', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Patients')
  await expect(page).toHaveURL(/.*patients/)
})
```

### Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Wait for network idle** before assertions
3. **Take screenshots** on failures (automatic)
4. **Use page objects** for complex flows

### Example Test Structure

```typescript
test.describe('Lab Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lab-orders')
  })

  test('should display lab orders list', async ({ page }) => {
    await expect(page.locator('[data-testid="lab-orders-list"]')).toBeVisible()
  })

  test('should create new lab order', async ({ page }) => {
    await page.click('[data-testid="new-order-button"]')
    await page.fill('[data-testid="patient-input"]', 'Patient Name')
    await page.click('[data-testid="submit-button"]')
    await expect(page.locator('.success-message')).toBeVisible()
  })
})
```

## Test Organization

```
src/
├── components/
│   ├── MyComponent.tsx
│   └── MyComponent.test.tsx    # Component tests
├── hooks/
│   ├── useMyHook.ts
│   └── useMyHook.test.ts       # Hook tests
├── lib/
│   ├── utils.ts
│   └── utils.test.ts           # Utility tests
└── test/
    └── setup.ts                # Test setup

e2e/
├── lab-orders.spec.ts          # E2E tests
├── patients.spec.ts
└── appointments.spec.ts
```

## Coverage

### Generate Coverage Report
```bash
yarn test:coverage
```

### Coverage Thresholds
Configure in `vitest.config.ts`:
```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests
  run: |
    yarn test:ci
    yarn test:e2e
```

### Test Scripts for CI
- `test:ci` - Runs Vitest in CI mode (no watch)
- `test:e2e` - Runs Playwright tests

## Debugging

### Vitest
```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/vitest

# Run specific test
yarn test MyComponent.test.tsx
```

### Playwright
```bash
# Run in headed mode
yarn test:e2e --headed

# Run with debugger
yarn test:e2e --debug

# Show trace
yarn test:e2e --trace on
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

---

**Last Updated**: December 2024

