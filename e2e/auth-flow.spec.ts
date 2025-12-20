/**
 * AUTH FLOW E2E TEST
 * 
 * Tests real Firebase authentication flows:
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Session persistence
 * - Logout
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, loginTestUser, logoutUser, isAuthenticated } from './fixtures/test-auth';

test.describe('Authentication Flow: Real Firebase', () => {

    test('Login with valid credentials redirects to dashboard', async ({ page }) => {
        await page.goto('/login');

        // Fill credentials
        await page.locator('input[name="email"]').fill(TEST_USERS.userA.email);
        await page.locator('input[name="password"]').fill(TEST_USERS.userA.password);

        // Submit
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL('/dashboard', { timeout: 15000 });

        // Dashboard should show user-specific content
        await expect(page.locator('text=Dashboard').or(page.locator('h1'))).toBeVisible();
    });

    test('Login with invalid credentials shows error', async ({ page }) => {
        await page.goto('/login');

        // Fill invalid credentials
        await page.locator('input[name="email"]').fill('nonexistent@test.com');
        await page.locator('input[name="password"]').fill('wrongpassword');

        // Submit
        await page.click('button[type="submit"]');

        // Should show error message
        await expect(
            page.locator('text=/invalid|error|incorrect|wrong|not found/i')
        ).toBeVisible({ timeout: 10000 });

        // Should NOT redirect to dashboard
        await expect(page).toHaveURL(/\/login/);
    });

    test('Session persists after page reload', async ({ page }) => {
        // Login
        await loginTestUser(page, 'userA');

        // Verify on dashboard
        await expect(page).toHaveURL('/dashboard');

        // Reload page
        await page.reload();

        // Should still be on dashboard (not redirected to login)
        await expect(page).toHaveURL('/dashboard');
    });

    test('Protected routes redirect to login when unauthenticated', async ({ page }) => {
        // Try to access protected route without auth
        await page.goto('/inventory');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('Logout clears session and redirects to login', async ({ page }) => {
        // Login first
        await loginTestUser(page, 'userA');
        await expect(page).toHaveURL('/dashboard');

        // Logout
        await logoutUser(page);

        // Should be on login page
        await expect(page).toHaveURL(/\/login/);

        // Try to access protected route
        await page.goto('/dashboard');

        // Should redirect back to login
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('Different users have isolated sessions', async ({ browser }) => {
        // User A session
        const contextA = await browser.newContext();
        const pageA = await contextA.newPage();
        await loginTestUser(pageA, 'userA');

        // User B session in different context
        const contextB = await browser.newContext();
        const pageB = await contextB.newPage();
        await loginTestUser(pageB, 'userB');

        // Both should be authenticated in their own contexts
        await pageA.goto('/dashboard');
        await expect(pageA).toHaveURL('/dashboard');

        await pageB.goto('/dashboard');
        await expect(pageB).toHaveURL('/dashboard');

        // Logout User A
        await logoutUser(pageA);

        // User B should still be authenticated
        await pageB.reload();
        await expect(pageB).toHaveURL('/dashboard');

        // Cleanup
        await contextA.close();
        await contextB.close();
    });
});

test.describe('Authentication Flow: Admin Access', () => {

    test('Admin user can access admin routes', async ({ page }) => {
        await loginTestUser(page, 'admin');

        // Navigate to admin area
        await page.goto('/admin/compliance');

        // Should not be redirected away
        await expect(page).toHaveURL(/\/admin/);

        // Should see admin content
        await expect(
            page.locator('text=Compliance').or(page.locator('text=Admin'))
        ).toBeVisible();
    });

    test('Regular user cannot access admin routes', async ({ page }) => {
        await loginTestUser(page, 'userA');

        // Try to access admin area
        await page.goto('/admin/compliance');

        // Should be redirected or see access denied
        const isRedirected = !page.url().includes('/admin');
        const hasAccessDenied = await page.locator('text=/access denied|unauthorized|forbidden/i').isVisible();

        expect(isRedirected || hasAccessDenied).toBeTruthy();
    });
});
