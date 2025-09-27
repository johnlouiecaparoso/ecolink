# 🧪 EcoLink Testing Guide

This document outlines the comprehensive testing strategy for the EcoLink platform.

## 📋 Testing Overview

Our testing strategy includes:

- **Unit Tests**: Component and service testing with Vitest
- **Integration Tests**: API and workflow testing
- **End-to-End Tests**: Full user journey testing with Playwright
- **Performance Tests**: Lighthouse CI for performance monitoring
- **Security Tests**: Vulnerability scanning and security audits

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm run test:all
```

### Run Specific Test Types

```bash
# Unit tests only
npm run test:run

# Unit tests with coverage
npm run test:coverage

# End-to-end tests
npm run test:e2e

# Performance tests
npm run lighthouse
```

## 🔧 Test Configuration

### Unit Tests (Vitest)

- **Framework**: Vitest with Vue Test Utils
- **Environment**: Happy DOM
- **Coverage**: V8 provider with 80% threshold
- **Location**: `src/test/`

### End-to-End Tests (Playwright)

- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Configuration**: `playwright.config.js`
- **Location**: `src/test/e2e/`

### Performance Tests (Lighthouse)

- **Tool**: Lighthouse CI
- **Metrics**: Performance, Accessibility, Best Practices, SEO
- **Thresholds**: Performance > 80%, Accessibility > 90%

## 📁 Test Structure

```
src/test/
├── setup.js                 # Test setup and mocks
├── run-tests.js            # Test runner script
├── services/               # Service unit tests
│   ├── authService.test.js
│   └── paymentService.test.js
├── components/             # Component unit tests
│   └── Button.test.js
└── e2e/                   # End-to-end tests
    ├── auth.spec.js
    └── marketplace.spec.js
```

## 🧪 Test Categories

### 1. Unit Tests

Test individual components and services in isolation.

**Coverage Areas:**

- Authentication services
- Payment processing
- User management
- Project workflows
- UI components

**Example:**

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button Component', () => {
  it('renders with default props', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.text()).toBe('Click me')
  })
})
```

### 2. Integration Tests

Test API endpoints and service interactions.

**Coverage Areas:**

- Database operations
- External API calls
- Authentication flows
- Payment processing

### 3. End-to-End Tests

Test complete user workflows.

**Coverage Areas:**

- User registration and login
- Project submission
- Credit purchasing
- Admin workflows
- Payment processing

**Example:**

```javascript
import { test, expect } from '@playwright/test'

test('should handle complete purchase flow', async ({ page }) => {
  await page.goto('/marketplace')
  await page.click('.purchase-button')
  await page.fill('input[name="quantity"]', '10')
  await page.click('button[type="submit"]')
  await expect(page.locator('.payment-modal')).toBeVisible()
})
```

### 4. Performance Tests

Monitor application performance and Core Web Vitals.

**Metrics Tracked:**

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)

## 🔍 Test Commands

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run test`          | Run unit tests in watch mode   |
| `npm run test:run`      | Run unit tests once            |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui`       | Run tests with UI interface    |
| `npm run test:e2e`      | Run end-to-end tests           |
| `npm run test:e2e:ui`   | Run E2E tests with UI          |
| `npm run test:all`      | Run all test suites            |
| `npm run lighthouse`    | Run performance tests          |
| `npm run lighthouse:ci` | Run Lighthouse CI              |

## 📊 Coverage Requirements

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🚀 CI/CD Integration

### GitHub Actions

Automated testing on every push and pull request:

1. **Linting**: Code quality checks
2. **Unit Tests**: Component and service tests
3. **E2E Tests**: Full workflow testing
4. **Performance**: Lighthouse CI
5. **Deployment**: Automatic deployment to Vercel

### Pre-commit Hooks

```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run test:run"
```

## 🐛 Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm run test src/test/services/authService.test.js

# Run with verbose output
npm run test -- --reporter=verbose

# Run with debug mode
npm run test -- --inspect-brk
```

### E2E Tests

```bash
# Run with headed browser
npx playwright test --headed

# Run specific test
npx playwright test auth.spec.js

# Debug mode
npx playwright test --debug
```

## 📈 Performance Monitoring

### Lighthouse CI

Automated performance monitoring with thresholds:

- **Performance**: > 80%
- **Accessibility**: > 90%
- **Best Practices**: > 80%
- **SEO**: > 80%

### Core Web Vitals

- **FCP**: < 2s
- **LCP**: < 4s
- **CLS**: < 0.1
- **TBT**: < 300ms

## 🔒 Security Testing

### Automated Security Checks

- Dependency vulnerability scanning
- OWASP security testing
- Authentication flow testing
- Payment security validation

### Manual Security Review

- SQL injection testing
- XSS vulnerability checks
- CSRF protection validation
- Authentication bypass testing

## 📝 Writing Tests

### Unit Test Best Practices

1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the function being tested
3. **Assert**: Verify the expected outcome

### E2E Test Best Practices

1. **Isolate**: Each test should be independent
2. **Realistic**: Use real user scenarios
3. **Stable**: Avoid flaky tests with proper waits
4. **Fast**: Optimize for speed without sacrificing reliability

## 🚨 Common Issues

### Test Failures

- Check test environment setup
- Verify mock configurations
- Ensure proper async handling
- Check for timing issues

### Performance Issues

- Optimize test data size
- Use proper wait strategies
- Minimize browser launches
- Cache test dependencies

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Vue Test Utils](https://test-utils.vuejs.org/)

## 🤝 Contributing

When adding new features:

1. Write unit tests for new components/services
2. Add E2E tests for new user workflows
3. Update performance baselines if needed
4. Ensure all tests pass before submitting PR

## 📞 Support

For testing issues or questions:

- Check existing test examples
- Review test documentation
- Ask in team channels
- Create issue for bugs


