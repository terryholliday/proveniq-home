import * as functions from 'firebase-functions';

// Mock database of valid sandbox API keys
// In a real implementation, this would be stored in Firestore or Secret Manager
const SANDBOX_API_KEYS = new Map<string, { partnerId: string, scopes: string[] }>([
    ['sb_key_lemonade_123', { partnerId: 'lemonade', scopes: ['policies.read', 'policies.write'] }],
    ['sb_key_markel_456', { partnerId: 'markel', scopes: ['policies.read', 'policies.write'] }],
    ['sb_key_google_789', { partnerId: 'google', scopes: ['devices.read'] }]
]);

export const validateSandboxKey = (req: functions.https.Request): { authorized: boolean, partnerId?: string, error?: string } => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authorized: false, error: 'Missing or invalid Authorization header' };
    }

    const token = authHeader.split('Bearer ')[1];

    if (SANDBOX_API_KEYS.has(token)) {
        const partnerData = SANDBOX_API_KEYS.get(token);
        return { authorized: true, partnerId: partnerData?.partnerId };
    }

    return { authorized: false, error: 'Invalid Sandbox API Key' };
};
