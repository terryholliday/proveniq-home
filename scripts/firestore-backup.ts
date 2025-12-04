import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin (assumes GOOGLE_APPLICATION_CREDENTIALS is set or running in a trusted env)
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function backupCollection(collectionName: string, backupDir: string) {
    console.log(`Backing up ${collectionName}...`);
    const snapshot = await db.collection(collectionName).get();
    const data: any[] = [];

    snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
    });

    const filePath = path.join(backupDir, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length} documents to ${filePath}`);
}

async function main() {
    const backupDir = path.join(__dirname, '..', 'backups', new Date().toISOString().replace(/[:.]/g, '-'));

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const collections = ['users', 'items', 'auctions', 'legal_documents', 'compliance_tasks'];

    for (const col of collections) {
        try {
            await backupCollection(col, backupDir);
        } catch (error) {
            console.error(`Error backing up ${col}:`, error);
        }
    }

    console.log(`Backup completed in ${backupDir}`);
}

main().catch(console.error);
