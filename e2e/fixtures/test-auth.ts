/**
 * E2E Test Authentication Fixtures
 * Provides reusable authentication helpers for Playwright tests.
 */

import { Page, BrowserContext } from '@playwright/test';

export const TEST_USERS = {
    userA: {
        email: 'test-user-a@proveniq-test.com',
        password: 'TestPassword123!',
        displayName: 'Test User A',
        tenantId: 'tenant-a'
    },
    userB: {
        email: 'test-user-b@proveniq-test.com',
        password: 'TestPassword123!',
        displayName: 'Test User B',
        tenantId: 'tenant-b'
    },
    admin: {
        email: 'test-admin@proveniq-test.com',
        password: 'AdminPassword123!',
        displayName: 'Test Admin',
        tenantId: 'system'
    }
} as const;

export type TestUserKey = keyof typeof TEST_USERS;

/**
 * Login a test user via the UI
 */
export async function loginTestUser(
    page: Page,
    userKey: TestUserKey,
    options: { waitForDashboard?: boolean } = {}
): Promise<void> {
    const user = TEST_USERS[userKey];
    const { waitForDashboard = true } = options;

    await page.goto('/login');

    // Clear and fill email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.click();
    await emailInput.fill('');
    await emailInput.fill(user.email);

    // Clear and fill password
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.click();
    await passwordInput.fill('');
    await passwordInput.fill(user.password);

    // Submit
    await page.click('button[type="submit"]');

    if (waitForDashboard) {
        await page.waitForURL('/dashboard', { timeout: 15000 });
    }
}

/**
 * Create an authenticated browser context for a test user
 */
export async function createAuthenticatedContext(
    browser: import('@playwright/test').Browser,
    userKey: TestUserKey
): Promise<{ context: BrowserContext; page: Page }> {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginTestUser(page, userKey);
    return { context, page };
}

/**
 * Logout the current user
 */
export async function logoutUser(page: Page): Promise<void> {
    // Navigate to settings or trigger logout
    await page.goto('/settings');
    const logoutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
    if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL('/login', { timeout: 10000 });
    }
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
    await page.goto('/dashboard');
    // If redirected to login, not authenticated
    return !page.url().includes('/login');
}
