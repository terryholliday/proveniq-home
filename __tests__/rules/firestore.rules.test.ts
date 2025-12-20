/**
 * FIRESTORE RULES TEST SUITE
 * 
 * Tests tenant isolation at the database level using Firebase Rules Unit Testing.
 * This is a LAUNCH BLOCKER - if these tests fail, multi-tenancy is broken.
 * 
 * Run with: npm test -- __tests__/rules/firestore.rules.test.ts
 */

import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

const PROJECT_ID = 'proveniq-rules-test';

// Test user contexts
const TENANT_A_USER = { uid: 'user-a', tenantId: 'tenant-a' };
const TENANT_B_USER = { uid: 'user-b', tenantId: 'tenant-b' };
const ADMIN_USER = { uid: 'admin-user', admin: true, tenantId: 'system' };
const UNAUTHENTICATED = null;

beforeAll(async () => {
    const rulesPath = path.join(process.cwd(), 'firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
            rules,
            host: 'localhost',
            port: 8080,
        },
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

function getFirestore(auth: { uid: string; tenantId?: string; admin?: boolean } | null) {
    if (!auth) {
        return testEnv.unauthenticatedContext().firestore();
    }
    return testEnv.authenticatedContext(auth.uid, {
        tenantId: auth.tenantId || 'consumer',
        admin: auth.admin || false,
    }).firestore();
}

describe('Firestore Rules: User Documents', () => {
    
    test('User can read their own profile', async () => {
        const db = getFirestore(TENANT_A_USER);
        
        // Seed data as admin
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'users', TENANT_A_USER.uid), {
            uid: TENANT_A_USER.uid,
            email: 'user-a@test.com',
            tenantId: TENANT_A_USER.tenantId,
        });

        // User A reads their own profile
        await assertSucceeds(getDoc(doc(db, 'users', TENANT_A_USER.uid)));
    });

    test('User cannot read another user profile', async () => {
        const db = getFirestore(TENANT_A_USER);
        
        // Seed User B's data
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'users', TENANT_B_USER.uid), {
            uid: TENANT_B_USER.uid,
            email: 'user-b@test.com',
            tenantId: TENANT_B_USER.tenantId,
        });

        // User A tries to read User B's profile
        await assertFails(getDoc(doc(db, 'users', TENANT_B_USER.uid)));
    });

    test('Unauthenticated user cannot read any profile', async () => {
        const db = getFirestore(UNAUTHENTICATED);
        await assertFails(getDoc(doc(db, 'users', TENANT_A_USER.uid)));
    });
});

describe('Firestore Rules: Items (Multi-Tenant Isolation)', () => {

    test('User can create item in their own tenant', async () => {
        const db = getFirestore(TENANT_A_USER);
        
        await assertSucceeds(
            setDoc(doc(db, 'items', 'item-a-1'), {
                title: 'Test Item A',
                tenantId: TENANT_A_USER.tenantId,
                userId: TENANT_A_USER.uid,
                createdAt: new Date(),
            })
        );
    });

    test('User cannot create item with different tenantId', async () => {
        const db = getFirestore(TENANT_A_USER);
        
        // User A tries to create item with Tenant B's tenantId
        await assertFails(
            setDoc(doc(db, 'items', 'item-spoofed'), {
                title: 'Spoofed Item',
                tenantId: TENANT_B_USER.tenantId, // WRONG TENANT
                userId: TENANT_A_USER.uid,
                createdAt: new Date(),
            })
        );
    });

    test('User cannot create item with different userId', async () => {
        const db = getFirestore(TENANT_A_USER);
        
        // User A tries to create item claiming to be User B
        await assertFails(
            setDoc(doc(db, 'items', 'item-spoofed'), {
                title: 'Spoofed Item',
                tenantId: TENANT_A_USER.tenantId,
                userId: TENANT_B_USER.uid, // WRONG USER
                createdAt: new Date(),
            })
        );
    });

    test('User can read items in their own tenant', async () => {
        // Seed item as admin
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'items', 'item-a-1'), {
            title: 'Tenant A Item',
            tenantId: TENANT_A_USER.tenantId,
            userId: TENANT_A_USER.uid,
        });

        const db = getFirestore(TENANT_A_USER);
        await assertSucceeds(getDoc(doc(db, 'items', 'item-a-1')));
    });

    test('User CANNOT read items from different tenant', async () => {
        // Seed item for Tenant B
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'items', 'item-b-1'), {
            title: 'Tenant B Secret Item',
            tenantId: TENANT_B_USER.tenantId,
            userId: TENANT_B_USER.uid,
        });

        // User A tries to read Tenant B's item
        const db = getFirestore(TENANT_A_USER);
        await assertFails(getDoc(doc(db, 'items', 'item-b-1')));
    });

    test('User can update their own items', async () => {
        // Seed item
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'items', 'item-a-1'), {
            title: 'Original Title',
            tenantId: TENANT_A_USER.tenantId,
            userId: TENANT_A_USER.uid,
        });

        const db = getFirestore(TENANT_A_USER);
        await assertSucceeds(
            setDoc(doc(db, 'items', 'item-a-1'), {
                title: 'Updated Title',
                tenantId: TENANT_A_USER.tenantId,
                userId: TENANT_A_USER.uid,
            })
        );
    });

    test('User cannot update items from different tenant', async () => {
        // Seed item for Tenant B
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'items', 'item-b-1'), {
            title: 'Tenant B Item',
            tenantId: TENANT_B_USER.tenantId,
            userId: TENANT_B_USER.uid,
        });

        // User A tries to update Tenant B's item
        const db = getFirestore(TENANT_A_USER);
        await assertFails(
            setDoc(doc(db, 'items', 'item-b-1'), {
                title: 'Hacked Title',
                tenantId: TENANT_B_USER.tenantId,
                userId: TENANT_B_USER.uid,
            })
        );
    });

    test('User can delete their own items', async () => {
        // Seed item
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'items', 'item-a-1'), {
            title: 'To Delete',
            tenantId: TENANT_A_USER.tenantId,
            userId: TENANT_A_USER.uid,
        });

        const db = getFirestore(TENANT_A_USER);
        await assertSucceeds(deleteDoc(doc(db, 'items', 'item-a-1')));
    });

    test('User cannot delete items from different tenant', async () => {
        // Seed item for Tenant B
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'items', 'item-b-1'), {
            title: 'Tenant B Item',
            tenantId: TENANT_B_USER.tenantId,
            userId: TENANT_B_USER.uid,
        });

        // User A tries to delete Tenant B's item
        const db = getFirestore(TENANT_A_USER);
        await assertFails(deleteDoc(doc(db, 'items', 'item-b-1')));
    });
});

describe('Firestore Rules: Audit Logs (Immutability)', () => {

    test('Authenticated user can create audit log', async () => {
        const db = getFirestore(TENANT_A_USER);
        
        await assertSucceeds(
            setDoc(doc(db, 'audit_logs', 'log-1'), {
                action: 'item_created',
                userId: TENANT_A_USER.uid,
                timestamp: new Date(),
            })
        );
    });

    test('User cannot update audit logs', async () => {
        // Seed log
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'audit_logs', 'log-1'), {
            action: 'item_created',
            userId: TENANT_A_USER.uid,
            timestamp: new Date(),
        });

        const db = getFirestore(TENANT_A_USER);
        await assertFails(
            setDoc(doc(db, 'audit_logs', 'log-1'), {
                action: 'TAMPERED',
                userId: TENANT_A_USER.uid,
                timestamp: new Date(),
            })
        );
    });

    test('User cannot delete audit logs', async () => {
        // Seed log
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'audit_logs', 'log-1'), {
            action: 'item_created',
            userId: TENANT_A_USER.uid,
            timestamp: new Date(),
        });

        const db = getFirestore(TENANT_A_USER);
        await assertFails(deleteDoc(doc(db, 'audit_logs', 'log-1')));
    });

    test('Regular user cannot read audit logs', async () => {
        // Seed log
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'audit_logs', 'log-1'), {
            action: 'item_created',
            userId: TENANT_A_USER.uid,
            timestamp: new Date(),
        });

        const db = getFirestore(TENANT_A_USER);
        await assertFails(getDoc(doc(db, 'audit_logs', 'log-1')));
    });

    test('Admin can read audit logs', async () => {
        // Seed log
        const adminDb = getFirestore(ADMIN_USER);
        await setDoc(doc(adminDb, 'audit_logs', 'log-1'), {
            action: 'item_created',
            userId: TENANT_A_USER.uid,
            timestamp: new Date(),
        });

        await assertSucceeds(getDoc(doc(adminDb, 'audit_logs', 'log-1')));
    });
});

describe('Firestore Rules: Legal Documents (Public Read)', () => {

    test('Unauthenticated user can read public legal docs', async () => {
        const db = getFirestore(UNAUTHENTICATED);
        
        // These should be readable without auth
        await assertSucceeds(getDoc(doc(db, 'legal_docs', 'privacy')));
        await assertSucceeds(getDoc(doc(db, 'legal_docs', 'tos')));
        await assertSucceeds(getDoc(doc(db, 'legal_docs', 'eula')));
    });

    test('Unauthenticated user cannot write legal docs', async () => {
        const db = getFirestore(UNAUTHENTICATED);
        
        await assertFails(
            setDoc(doc(db, 'legal_docs', 'privacy'), {
                content: 'Hacked content',
            })
        );
    });

    test('Admin can write legal docs', async () => {
        const db = getFirestore(ADMIN_USER);
        
        await assertSucceeds(
            setDoc(doc(db, 'legal_docs', 'privacy'), {
                content: 'Privacy policy content',
                status: 'published',
            })
        );
    });
});
