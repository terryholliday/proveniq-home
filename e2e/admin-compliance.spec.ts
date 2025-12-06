import { test, expect } from '@playwright/test';

test('Admin Compliance Dashboard: Roles and Reporting', async ({ page }) => {
    // 1. Login as admin (simulated by going directly if validation is lax, or assume authenticated state)
    // In this app, we can trigger admin access via the copyright click
    await page.goto('/');

    // Click copyright 5 times
    const copyright = page.getByText(/©.*MyARK/i); // Adjust selector if needed
    if (await copyright.count() > 0) {
        for (let i = 0; i < 6; i++) {
            await copyright.click();
            await page.waitForTimeout(200);
        }
    } else {
        // Fallback: direct navigation if trigger is hard to hit in test
        await page.goto('/admin/compliance');
    }

    // 2. Verify Dashboard Loads
    await expect(page.getByText('Compliance Dashboard')).toBeVisible();

    // 3. Sync Seed Data
    await page.getByText('Sync Seed Data').click();
    // Wait for sync to likely complete (could check for "Syncing..." to disappear)
    await expect(page.getByText('Syncing...')).not.toBeVisible({ timeout: 5000 });

    // 4. Verify Roles Tab
    await page.getByText('Roles & Responsibilities').click();
    await expect(page.getByText('Chief Compliance Officer')).toBeVisible();
    await expect(page.getByText('Head of Information Security')).toBeVisible();

    // 5. Verify Report Generation
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Generate Report').click();
    const download = await downloadPromise;

    // Wait for the download process to complete
    expect(download.suggestedFilename()).toContain('compliance_report');
});
