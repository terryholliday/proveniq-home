import { test, expect } from '@playwright/test';

test.describe('Consent Modal', () => {
    test('should display consent modal for new users', async ({ page }) => {
        // Mock user as not having consented
        await page.route('**/api/user/profile', async route => {
            const json = {
                id: 'test-user',
                consents: {}
            };
            await route.fulfill({ json });
        });

        await page.goto('/dashboard');

        // Check if modal is visible
        const modal = page.locator('text=Important Update: Data Storage & Privacy');
        await expect(modal).toBeVisible();

        // Accept consent
        await page.click('text=I Agree to Cloud Storage');

        // Verify modal closes
        await expect(modal).not.toBeVisible();
    });

    test('should not display consent modal if already consented', async ({ page }) => {
        // Mock user as having consented
        await page.route('**/api/user/profile', async route => {
            const json = {
                id: 'test-user',
                consents: {
                    cloudStorage: {
                        accepted: true,
                        policyVersion: '2.0-cloud-migration'
                    }
                }
            };
            await route.fulfill({ json });
        });

        await page.goto('/dashboard');

        // Check if modal is NOT visible
        const modal = page.locator('text=Important Update: Data Storage & Privacy');
        await expect(modal).not.toBeVisible();
    });
});
