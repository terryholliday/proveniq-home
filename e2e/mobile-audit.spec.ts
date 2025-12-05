import { test, expect } from '@playwright/test';

test.describe('Mobile Audit', () => {
    // Use iPhone 12/13 viewport
    test.use({ viewport: { width: 390, height: 844 } });

    test('should display consent modal correctly on mobile', async ({ page }) => {
        // Mock user as not having consented
        await page.addInitScript(() => {
            (window as any).__MOCK_USER__ = { uid: 'test-user' };
            (window as any).__MOCK_CONSENT_STATE__ = { accepted: false };
        });

        await page.goto('/dashboard');

        const modal = page.locator('text=Important Update: Data Storage & Privacy');
        await expect(modal).toBeVisible();

        // Ensure the "I Agree" button is visible and clickable (not off-screen)
        const agreeButton = page.locator('button:has-text("I Agree to Cloud Storage")');
        await expect(agreeButton).toBeVisible();
    });

    test('should display footer elements correctly', async ({ page }) => {
        // Navigate to home page which uses PublicLayout (and has footer)
        await page.goto('/');

        // Check AdminAccessTrigger visibility in footer
        // The trigger wraps the copyright text
        const footerText = page.locator('text=MyARK, Inc.');
        await expect(footerText).toBeVisible();
    });
});
