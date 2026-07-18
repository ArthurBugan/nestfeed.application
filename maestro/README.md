# Maestro E2E Tests

This directory contains end-to-end tests for the NestFeed/Groupify React Native Expo app using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

1. Install Maestro CLI:
   ```bash
   brew install maestro
   ```

2. Start an emulator or connect a physical device:
   ```bash
   # For iOS
   npx expo run:ios
   
   # For Android
   npx expo run:android
   ```

## Running Tests

### Run all tests
```bash
maestro test maestro/
```

### Run a specific test
```bash
maestro test maestro/login-flow.yaml
```

### Run tests with a specific device
```bash
maestro test maestro/login-flow.yaml --device "iPhone 15"
```

### Run tests in headless mode (CI/CD)
```bash
maestro test maestro/ --headless
```

### Run tests with JUnit output (CI/CD)
```bash
maestro test maestro/ --format junit
```

## Test Suite Overview

### Authentication Flows
| Test File | Description |
|-----------|-------------|
| `login-flow.yaml` | Complete login flow with valid credentials |
| `register-flow.yaml` | New user registration flow |
| `forgot-password-flow.yaml` | Password reset navigation |
| `forgot-password-success.yaml` | Forgot password success screen |
| `reset-password.yaml` | Password reset form with validation |
| `invalid-login.yaml` | Error handling for invalid credentials |
| `registration-errors.yaml` | Validation error handling during registration |
| `oauth-login-options.yaml` | OAuth button visibility and error states |
| `logout-flow.yaml` | User logout flow with confirmation |

### Navigation Flows
| Test File | Description |
|-----------|-------------|
| `complete-navigation.yaml` | Full navigation through all app sections |
| `complete-user-journey.yaml` | End-to-end user journey from registration to usage |
| `groups-listing.yaml` | Groups list navigation and search |
| `create-group.yaml` | New group creation flow |
| `group-detail-tabs.yaml` | Group detail view with tabs |
| `channels-navigation.yaml` | Channels section navigation |
| `edit-channel.yaml` | Channel edit screen navigation |
| `edit-anime.yaml` | Anime edit screen navigation |
| `blog-navigation.yaml` | Blog section navigation |
| `websites-navigation.yaml` | Websites section navigation |
| `groupshelf-navigation.yaml` | Group Shelf navigation |
| `share-links-navigation.yaml` | Share Links navigation |
| `more-tab.yaml` | More tab screen and navigation |

### Settings & Preferences
| Test File | Description |
|-----------|-------------|
| `settings-navigation.yaml` | All settings sections navigation |
| `account-settings.yaml` | Account settings page with profile |
| `appearance.yaml` | Appearance settings (theme, font, accessibility) |
| `billing.yaml` | Billing/subscription screen |
| `dark-mode-toggle.yaml` | Dark mode appearance toggle |

### Legal & Support
| Test File | Description |
|-----------|-------------|
| `terms.yaml` | Terms of Service screen |
| `privacy.yaml` | Privacy Policy screen |
| `support.yaml` | Help & Support screen |

## Test Structure

Each test file follows this structure:
```yaml
appId: com.groupifyapp
env:
  TEST_EMAIL: "demo@demo.com"
  TEST_PASSWORD: "teste1234"

---
- launchApp
- assertVisible: "Welcome Back"
- tapOn: "Email"
- inputText: "${TEST_EMAIL}"
- tapOn: "Sign In"
- assertVisible: "Dashboard"
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TEST_EMAIL` | Test user email | `demo@demo.com` |
| `TEST_PASSWORD` | Test user password | `teste1234` |
| `TEST_NAME` | Test user name | `Test User` |

## CI/CD Integration

Add to your CI/CD pipeline:
```yaml
- name: Install Maestro
  run: brew install maestro

- name: Run Maestro E2E Tests
  run: maestro test maestro/ --format junit
```

## Test Coverage Matrix

| Screen | Test Coverage |
|--------|--------------|
| Login | ✅ `login-flow.yaml`, `invalid-login.yaml` |
| Register | ✅ `register-flow.yaml`, `registration-errors.yaml` |
| Forgot Password | ✅ `forgot-password-flow.yaml`, `forgot-password-success.yaml` |
| Reset Password | ✅ `reset-password.yaml` |
| OAuth Login | ✅ `oauth-login-options.yaml` |
| Dashboard | ✅ `complete-navigation.yaml`, `complete-user-journey.yaml` |
| Groups | ✅ `groups-listing.yaml`, `create-group.yaml`, `group-detail-tabs.yaml` |
| Channels | ✅ `channels-navigation.yaml`, `edit-channel.yaml` |
| Animes | ✅ `edit-anime.yaml` |
| Websites | ✅ `websites-navigation.yaml` |
| Group Shelf | ✅ `groupshelf-navigation.yaml` |
| Share Links | ✅ `share-links-navigation.yaml` |
| Blog | ✅ `blog-navigation.yaml` |
| Settings | ✅ `settings-navigation.yaml` |
| Account Settings | ✅ `account-settings.yaml` |
| Appearance | ✅ `appearance.yaml`, `dark-mode-toggle.yaml` |
| Billing | ✅ `billing.yaml` |
| Terms of Service | ✅ `terms.yaml` |
| Privacy Policy | ✅ `privacy.yaml` |
| Support | ✅ `support.yaml` |
| More Tab | ✅ `more-tab.yaml` |
| Logout | ✅ `logout-flow.yaml` |

## Troubleshooting

1. **Tests failing due to loading states**: Add `waitForAnimationToEnd` after network requests
2. **Element not found**: Check if the element has a unique `text`, `placeholder`, or `id`
3. **Slow tests**: Use `speed: "fast"` for swipe operations
4. **Emulator issues**: Ensure the emulator is fully booted before running tests
5. **Optional assertions**: Some assertions use `optional: true` for elements that may not appear in all states

## Contributing

1. Create a new test file in the `maestro/` directory
2. Follow the naming convention: `<feature>-<action>.yaml`
3. Include environment variables if needed
4. Add assertions to verify the expected UI state
5. Run `maestro test <your-test.yaml>` to verify
6. Update this README with the new test in the coverage matrix

## Useful Commands

```bash
# List all available devices
maestro device list

# Start a new test recording
maestro record maestro/new-test.yaml

# Format test files
maestro format maestro/

# Dry run (validate syntax only)
maestro test maestro/ --dry-run

# Run tests with verbose output
maestro test maestro/ -v
```
