import { test, expect } from '@playwright/test';

test.describe('Tax Estimation', () => {
    test('should display estimated tax on auction card', async ({ page }) => {
        // Mock auction data
        await page.route('**/api/auctions', async route => {
            const json = [{
                id: 'auction-1',
                title: 'Test Item',
                currentBid: 100,
                startingBid: 50,
                status: 'live'
            }];
            await route.fulfill({ json });
        });

        await page.goto('/auctions');

        // Check for tax display
        // 100 * 0.07 = 7.00
        const taxDisplay = page.locator('text=Est. Tax (FL): $7.00');
        await expect(taxDisplay).toBeVisible();
    });
});
