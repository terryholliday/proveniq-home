/**
 * AUTH FLOW E2E TEST
 * 
 * Tests real Firebase authentication flows.
 * Uses real Firebase project (proveniq-home-prod).
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-auth';

// Longer timeout for Firebase auth operations
test.setTimeout(60000);

test.describe('Authentication Flow', () => {

    test('Login page loads correctly', async ({ page }) => {
        await page.goto('/login');
        
        // Verify login form elements exist
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test('Login with valid credentials succeeds', async ({ page }) => {
        await page.goto('/login');

        // Fill credentials
        await page.locator('input[name="email"]').fill(TEST_USERS.userA.email);
        await page.locator('input[name="password"]').fill(TEST_USERS.userA.password);

        // Submit
        await page.click('button:has-text("Sign In")');

        // Wait for navigation away from login (to dashboard or any authenticated page)
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });

        // Verify we're no longer on login page
        expect(page.url()).not.toContain('/login');
    });

    test('Login with invalid credentials shows error', async ({ page }) => {
        await page.goto('/login');

        // Fill invalid credentials
        await page.locator('input[name="email"]').fill('nonexistent@test.com');
        await page.locator('input[name="password"]').fill('wrongpassword');

        // Submit
        await page.click('button:has-text("Sign In")');

        // Should show error message (Firebase error)
        await expect(
            page.locator('[role="alert"], .text-red-600, .bg-red-50')
        ).toBeVisible({ timeout: 15000 });

        // Should still be on login page
        expect(page.url()).toContain('/login');
    });

    test('Admin login succeeds', async ({ page }) => {
        await page.goto('/login');

        // Fill admin credentials
        await page.locator('input[name="email"]').fill(TEST_USERS.admin.email);
        await page.locator('input[name="password"]').fill(TEST_USERS.admin.password);

        // Submit
        await page.click('button:has-text("Sign In")');

        // Wait for navigation away from login
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });

        // Verify we're no longer on login page
        expect(page.url()).not.toContain('/login');
    });
});
