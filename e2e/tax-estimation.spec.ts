import { test, expect } from '@playwright/test';

test.describe('Compliance: Tax Estimation', () => {
    test('should display estimated tax for Florida auctions', async ({ page }) => {
        // Mock user and auction data
        await page.addInitScript(() => {
            (window as any).__MOCK_USER__ = { uid: 'test-user' };
            (window as any).__MOCK_FIRESTORE_DATA__ = {
                'auctions': [
                    {
                        id: 'auction-1',
                        title: 'Florida Estate Sale',
                        location: 'FL',
                        currentBid: 1000,
                        startingBid: 1000,
                        status: 'active',
                        ownerUid: 'test-user', // Matches the query in AuctionsPage
                        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
                    }
                ]
            };
        });

        // Navigate to the auctions list page where tax is displayed
        await page.goto('/auctions');

        // Check for Tax Estimation line
        const taxLine = page.locator('text=Est. Tax');
        await expect(taxLine).toBeVisible();

        // Verify it shows a value formatted as currency
        // 7% of 1000 is 70.00
        const taxValue = page.locator('text=$70.00');
        await expect(taxValue).toBeVisible();
    });
});
