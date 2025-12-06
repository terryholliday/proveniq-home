import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { validateSandboxKey } from "./auth";

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

export const sandboxApi = onRequest({ cors: true }, async (req, res) => {
    const validation = validateSandboxKey(req);
    if (!validation.authorized) {
        res.status(403).json({ error: validation.error });
        return;
    }

    // Basic routing
    // Expected paths: 
    // GET /users/:userId
    // GET /users/:userId/assets

    const pathParts = req.path.split('/').filter(p => p);
    // e.g. ['', 'users', 'sandbox-test-user-001'] -> ['users', 'sandbox-test-user-001']

    try {
        if (req.method === 'GET') {
            if (pathParts[0] === 'users' && pathParts[1]) {
                const userId = pathParts[1];
                const userRef = db.collection('users').doc(userId);

                if (pathParts[2] === 'assets') {
                    const assetsSnap = await userRef.collection('assets').get();
                    const assets = assetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    res.json({ assets });
                    return;
                } else if (pathParts[2] === 'policies') {
                    const policiesSnap = await userRef.collection('policies').get();
                    const policies = policiesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    res.json({ policies });
                    return;
                } else if (pathParts.length === 2) {
                    const userSnap = await userRef.get();
                    if (!userSnap.exists) {
                        res.status(404).json({ error: 'User not found' });
                        return;
                    }
                    res.json({ id: userSnap.id, ...userSnap.data() });
                    return;
                }
            }
        } else if (req.method === 'POST') {
            // POST /users/:userId/policies - Insurance partner policy sync
            if (pathParts[0] === 'users' && pathParts[1] && pathParts[2] === 'policies') {
                const userId = pathParts[1];
                const policyData = req.body;
                const userRef = db.collection('users').doc(userId);
                const policyRef = await userRef.collection('policies').add({
                    ...policyData,
                    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                    syncedBy: validation.partnerId
                });
                logger.info(`Policy synced by ${validation.partnerId} for user ${userId}`);
                res.status(201).json({ id: policyRef.id, message: 'Policy synced successfully' });
                return;
            }
            // POST /webhooks/devices - Smart home device discovery
            if (pathParts[0] === 'webhooks' && pathParts[1] === 'devices') {
                const { userId, devices } = req.body;
                if (!userId || !devices) {
                    res.status(400).json({ error: 'Missing userId or devices in body' });
                    return;
                }
                const userRef = db.collection('users').doc(userId);
                const batch = db.batch();
                for (const device of devices) {
                    const assetRef = userRef.collection('assets').doc();
                    batch.set(assetRef, {
                        name: device.name,
                        category: 'Smart Home Device',
                        serialNumber: device.serialNumber,
                        manufacturer: device.manufacturer,
                        discoveredAt: admin.firestore.FieldValue.serverTimestamp(),
                        discoveredBy: validation.partnerId
                    });
                }
                await batch.commit();
                logger.info(`${devices.length} devices discovered by ${validation.partnerId} for user ${userId}`);
                res.status(201).json({ message: `${devices.length} devices added as assets` });
                return;
            }
            res.status(405).json({ error: 'Method Not Allowed for this path' });
            return;
        } else {
            res.status(405).json({ error: 'Method Not Allowed' });
            return;
        }

        res.status(404).json({ error: 'Not Found', path: req.path });
    } catch (e) {
        logger.error("Sandbox API Error", e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
