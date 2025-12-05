import { test, expect } from '@playwright/test';

test.describe('Consent Modal', () => {
    test('should display consent modal for new users', async ({ page }) => {
        // Mock user and consent state via window object (handled by DashboardLayout)
        await page.addInitScript(() => {
            (window as any).__MOCK_USER__ = { uid: 'test-user' };
            (window as any).__MOCK_CONSENT_STATE__ = { accepted: false };
        });

        await page.goto('/dashboard');

        // Check if modal is visible
        const modal = page.locator('text=Important Update: Data Storage & Privacy');
        await expect(modal).toBeVisible();

        // Note: We cannot easily test the "Accept" flow because it requires mocking setDoc/Firestore write.
        // For now, we verify the modal appears.
    });

    test('should not display consent modal if already consented', async ({ page }) => {
        await page.addInitScript(() => {
            (window as any).__MOCK_USER__ = { uid: 'test-user' };
            (window as any).__MOCK_CONSENT_STATE__ = { accepted: true };
        });

        await page.goto('/dashboard');

        // Check if modal is NOT visible
        const modal = page.locator('text=Important Update: Data Storage & Privacy');
        await expect(modal).not.toBeVisible();
    });
});
