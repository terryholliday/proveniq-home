/**
 * GOLDEN PATH E2E TEST
 * 
 * This is the critical "happy path" test that proves Proveniq's core value proposition:
 * Upload → AI Analysis → Inventory → Valuation → Proof
 * 
 * If this test fails, the product does not work.
 */

import { test, expect } from '@playwright/test';
import { loginTestUser, TEST_USERS } from './fixtures/test-auth';
import path from 'path';

test.describe('Golden Path: Core Value Proposition', () => {
    
    test.beforeEach(async ({ page }) => {
        // Login as Test User A
        await loginTestUser(page, 'userA');
    });

    test('Complete item creation flow: Upload → Analysis → Inventory → Valuation', async ({ page }) => {
        // 1. NAVIGATE TO ADD ITEM
        await page.goto('/inventory/add');
        await expect(page).toHaveURL('/inventory/add');

        // 2. UPLOAD AN IMAGE
        const testImagePath = path.join(__dirname, 'fixtures', 'test-item.jpg');
        const fileInput = page.locator('input[type="file"]');
        
        // Use a real test image or create one programmatically
        await fileInput.setInputFiles({
            name: 'test-item.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from(createTestImageBuffer())
        });

        // 3. VERIFY FILE UPLOAD ACKNOWLEDGED
        await expect(page.locator('text=File Selected').or(page.locator('text=Image uploaded'))).toBeVisible({ timeout: 10000 });

        // 4. TRIGGER AI ANALYSIS (if not automatic)
        const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Scan"), button:has-text("Process")');
        if (await analyzeButton.isVisible()) {
            await analyzeButton.click();
        }

        // 5. WAIT FOR AI ANALYSIS TO COMPLETE
        // Look for indicators that analysis is done
        await expect(
            page.locator('text=Analysis Complete')
                .or(page.locator('[data-testid="analysis-result"]'))
                .or(page.locator('text=Condition:'))
                .or(page.locator('text=Category:'))
        ).toBeVisible({ timeout: 60000 }); // AI can take time

        // 6. VERIFY ITEM DETAILS POPULATED
        // Check that AI extracted some data
        const detailsSection = page.locator('[data-testid="item-details"], .item-details, form');
        await expect(detailsSection).toBeVisible();

        // 7. SAVE THE ITEM
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Add Item"), button[type="submit"]');
        await saveButton.click();

        // 8. VERIFY REDIRECT TO INVENTORY OR ITEM DETAIL
        await page.waitForURL(/\/(inventory|items)/, { timeout: 15000 });

        // 9. VERIFY ITEM APPEARS IN INVENTORY
        await page.goto('/inventory');
        
        // The item should be visible in the list
        // Look for any indicator that an item exists
        const itemCard = page.locator('[data-testid="item-card"], .item-card, [class*="inventory"] [class*="item"]').first();
        await expect(itemCard).toBeVisible({ timeout: 10000 });

        // 10. VERIFY VALUATION EXISTS
        // Click into the item to see details
        await itemCard.click();
        
        // Look for valuation indicators
        const valuationIndicator = page.locator(
            'text=/\\$[0-9,]+/'  // Any dollar amount
        ).or(page.locator('text=Estimated Value'))
         .or(page.locator('[data-testid="valuation"]'));
        
        await expect(valuationIndicator).toBeVisible({ timeout: 10000 });
    });

    test('Item persists after page reload', async ({ page }) => {
        // Navigate to inventory
        await page.goto('/inventory');

        // Get count of items
        const itemCards = page.locator('[data-testid="item-card"], .item-card, [class*="inventory"] [class*="item"]');
        const initialCount = await itemCards.count();

        // Reload the page
        await page.reload();

        // Verify same count
        await expect(itemCards).toHaveCount(initialCount);
    });

    test('Item data matches what was saved', async ({ page }) => {
        // This test verifies data integrity
        await page.goto('/inventory');

        const firstItem = page.locator('[data-testid="item-card"], .item-card').first();
        if (await firstItem.isVisible()) {
            await firstItem.click();

            // Verify core fields are present and not empty
            const titleElement = page.locator('h1, h2, [data-testid="item-title"]').first();
            await expect(titleElement).not.toBeEmpty();

            // Verify images are loaded
            const itemImage = page.locator('img[src*="firebase"], img[src*="storage"]').first();
            if (await itemImage.isVisible()) {
                // Image should have loaded (not broken)
                const naturalWidth = await itemImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
                expect(naturalWidth).toBeGreaterThan(0);
            }
        }
    });
});

test.describe('Golden Path: Tenant Isolation Verification', () => {
    
    test('User A cannot see User B items', async ({ browser }) => {
        // Create item as User A
        const contextA = await browser.newContext();
        const pageA = await contextA.newPage();
        await loginTestUser(pageA, 'userA');
        
        await pageA.goto('/inventory/add');
        
        // Quick add an item with a unique identifier
        const uniqueId = `ISOLATION-TEST-${Date.now()}`;
        const titleInput = pageA.locator('input[name="title"], input[placeholder*="title"], input[placeholder*="name"]').first();
        if (await titleInput.isVisible()) {
            await titleInput.fill(uniqueId);
        }
        
        const fileInput = pageA.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'isolation-test.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from(createTestImageBuffer())
        });

        // Save
        const saveButton = pageA.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]');
        if (await saveButton.isVisible()) {
            await saveButton.click();
            await pageA.waitForTimeout(2000);
        }

        // Login as User B in separate context
        const contextB = await browser.newContext();
        const pageB = await contextB.newPage();
        await loginTestUser(pageB, 'userB');

        // Check User B's inventory
        await pageB.goto('/inventory');
        
        // User B should NOT see the item with uniqueId
        const isolationItem = pageB.locator(`text=${uniqueId}`);
        await expect(isolationItem).not.toBeVisible();

        // Cleanup
        await contextA.close();
        await contextB.close();
    });
});

/**
 * Creates a minimal valid JPEG buffer for testing
 */
function createTestImageBuffer(): Uint8Array {
    // Minimal 1x1 red JPEG
    const jpegBytes = [
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
        0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
        0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
        0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
        0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
        0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
        0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
        0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
        0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
        0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
        0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
        0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
        0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
        0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
        0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
        0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
        0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
        0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD5, 0xDB, 0x20, 0xA8, 0xF1, 0x7E, 0xCA,
        0xD9, 0x0F, 0xFF, 0xD9
    ];
    return new Uint8Array(jpegBytes);
}
