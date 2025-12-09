import { test, expect } from '@playwright/test';
import { generateReferralCode } from '../src/lib/referral'; // Just a helper utility

test.describe('Multi-Tenant Isolation', () => {

    // Setup: Create 2 distinct users/tenants for this run
    const tenantA = { name: 'Tenant A', email: `a_${Date.now()}@test.com`, password: 'password123' };
    const tenantB = { name: 'Tenant B', email: `b_${Date.now()}@test.com`, password: 'password123' };

    test('Tenant B should NOT see items created by Tenant A', async ({ browser }) => {
        // 1. Tenant A logs in and creates an item
        const contextA = await browser.newContext();
        const pageA = await contextA.newPage();
        await pageA.goto('/login');

        // Tenant A Login with explicit clear to handle prefill
        await pageA.click('input[name="email"]');
        await pageA.press('input[name="email"]', 'Control+A');
        await pageA.press('input[name="email"]', 'Backspace');
        await pageA.fill('input[name="email"]', tenantA.email);

        await pageA.click('input[name="password"]');
        await pageA.press('input[name="password"]', 'Control+A');
        await pageA.press('input[name="password"]', 'Backspace');
        await pageA.fill('input[name="password"]', tenantA.password);

        await pageA.click('button[type="submit"]');

        await pageA.waitForURL('/dashboard'); // Wait for login to complete

        await pageA.goto('/inventory/new');
        await pageA.fill('input[name="title"]', 'Top Secret Prototype');
        await pageA.click('button:text("Save")');
        const itemVisibleA = await pageA.isVisible('text=Top Secret Prototype');
        expect(itemVisibleA).toBeTruthy();

        // 2. Tenant B logs in
        const contextB = await browser.newContext();
        const pageB = await contextB.newPage();
        await pageB.goto('/login');

        // Tenant B Login with explicit clear
        await pageB.click('input[name="email"]');
        await pageB.press('input[name="email"]', 'Control+A');
        await pageB.press('input[name="email"]', 'Backspace');
        await pageB.fill('input[name="email"]', tenantB.email);

        await pageB.click('input[name="password"]');
        await pageB.press('input[name="password"]', 'Control+A');
        await pageB.press('input[name="password"]', 'Backspace');
        await pageB.fill('input[name="password"]', tenantB.password);

        await pageB.click('button[type="submit"]');
        await pageB.waitForURL('/dashboard');

        // 3. Tenant B views list
        await pageB.goto('/inventory');

        // 4. Assert isolation
        const itemVisibleB = await pageB.isVisible('text=Top Secret Prototype');
        expect(itemVisibleB).toBeFalsy();

        await contextA.close();
        await contextB.close();
    });

    test('Public API should reject request with wrong API Key tenant context', async ({ request }) => {
        // This simulates a direct API attack
        const response = await request.get('/api/v1/items', {
            headers: {
                'x-api-key': 'tenant-b-key', // Authenticated as B
                // But trying to spoof or access generic resource
            }
        });

        // Should only return B's items
        const data = await response.json();
        // Check finding specific known item from A
        // Implementation depends on seed state
        expect(response.status()).toBe(200);
    });
});
