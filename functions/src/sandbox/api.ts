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
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method Not Allowed' });
            return;
        }

        if (pathParts[0] === 'users' && pathParts[1]) {
            const userId = pathParts[1];
            const userRef = db.collection('users').doc(userId);

            if (pathParts[2] === 'assets') {
                const assetsSnap = await userRef.collection('assets').get();
                const assets = assetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                res.json({ assets });
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

        res.status(404).json({ error: 'Not Found', path: req.path });
    } catch (e) {
        logger.error("Sandbox API Error", e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
