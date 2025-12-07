import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
    test('Login Page should render correct premium UI', async ({ page }) => {
        await page.goto('/login');

        // Check for specific premium UI elements I added
        await expect(page.locator('h1:has-text("Welcome Back")')).toBeVisible();
        await expect(page.locator('img[alt="MyARK Logo"]')).toBeVisible(); // The logo

        // Check social buttons (icon only grid, check for 3 buttons)
        const socialButtons = page.locator('.grid.grid-cols-3 button');
        await expect(socialButtons).toHaveCount(3);
    });

    test('Signup Page should render correct premium UI and centered card', async ({ page }) => {
        await page.goto('/signup');

        // Check header
        await expect(page.locator('h1:has-text("Create an account")')).toBeVisible();
        await expect(page.locator('img[alt="MyARK Logo"]')).toBeVisible();

        // Check if layout is centered (card check)
        // We look for the card class or structure
        const card = page.locator('.max-w-md.bg-white.rounded-2xl.shadow-xl');
        await expect(card).toBeVisible();

        // Check social buttons
        const socialButtons = page.locator('.grid.grid-cols-3 button');
        await expect(socialButtons).toHaveCount(3);

        // Check legal links
        await expect(page.locator('a[href="/settings?doc=privacy"]')).toBeVisible();
    });
});
