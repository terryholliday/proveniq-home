import { test, expect } from '@playwright/test';

test.describe('Smoke Test: Core Flows', () => {
    test('should allow user to initiate item addition via file upload', async ({ page }) => {
        // 1. Mock User State
        await page.addInitScript(() => {
            (window as any).__MOCK_USER__ = { uid: 'test-user' };
        });

        // 2. Navigate to Add Item Page
        await page.goto('/inventory/add');
        await expect(page).toHaveURL('/inventory/add');

        // 3. Upload a file
        // distinct file name to verify in toast
        const fileName = 'test-image.png';
        const fileContent = 'dummy content';

        // Locate the hidden file input
        const fileInput = page.locator('input[type="file"]');

        // Create a buffer for the file
        await fileInput.setInputFiles({
            name: fileName,
            mimeType: 'image/png',
            buffer: Buffer.from(fileContent)
        });

        // 4. Verify Success Toast
        // The toast should contain the file name
        const toastTitle = page.locator('text=File Selected').first();
        const toastDesc = page.locator(`text=${fileName} is ready to be scanned.`);

        await expect(toastTitle).toBeVisible();
        await expect(toastDesc).toBeVisible();
    });
});
