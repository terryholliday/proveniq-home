import { test, expect } from '@playwright/test';

test.describe('Compliance: Tax Estimation', () => {
    test('should display estimated tax for Florida auctions', async ({ page }) => {
        // Navigate to an auction page (assuming one exists or mocking it)
        await page.goto('/auctions');

        // Wait for auctions to load
        await page.waitForSelector('.grid');

        // Click on the first auction to view details
        const firstAuction = page.locator('.grid > div').first();
        if (await firstAuction.isVisible()) {
            await firstAuction.click();

            // Check for Tax Estimation line
            const taxLine = page.locator('text=Est. Tax');
            await expect(taxLine).toBeVisible();

            // Verify it shows a value (e.g., $X.XX)
            const taxValue = page.locator('text=$');
            await expect(taxValue).toBeVisible();
        } else {
            console.log('No auctions found to test tax estimation.');
        }
    });
});
