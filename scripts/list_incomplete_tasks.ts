
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const STATUS_FILE = path.join(DOCS_DIR, 'ecosystem_status.md');

async function main() {
    if (!fs.existsSync(STATUS_FILE)) {
        console.error('Status file not found.');
        process.exit(1);
    }

    const content = fs.readFileSync(STATUS_FILE, 'utf-8');
    const lines = content.split('\n');

    let currentPhase = 'Unknown Phase';
    let currentRole = 'Unknown Role';

    // Structure: Phase -> Role -> Tasks[]
    const data: Record<string, Record<string, string[]>> = {};

    for (const line of lines) {
        const trimmed = line.trim();

        if (line.startsWith('## ')) {
            currentPhase = line.replace('## ', '').trim();
            // Reset role when phase changes
            currentRole = 'General';
            if (!data[currentPhase]) data[currentPhase] = {};
        } else if (line.startsWith('### ')) {
            currentRole = line.replace('### ', '').trim();
            if (!data[currentPhase]) data[currentPhase] = {};
            if (!data[currentPhase][currentRole]) data[currentPhase][currentRole] = [];
        } else if (trimmed.startsWith('- [ ]')) {
            // Extract the bolded title if present, otherwise the whole line
            let task = trimmed.replace('- [ ]', '').trim();

            // If task has bolding **Title**, extract it for brevity, but keep description if it's on the same line
            // The file format is `- [ ] **Title**` usually followed by description on next indented lines.
            // We'll just grab the title line for the summary list.
            task = task.replace(/\*\*/g, '');

            if (!data[currentPhase]) data[currentPhase] = {}; // Safety
            if (!data[currentPhase][currentRole]) data[currentPhase][currentRole] = [];

            data[currentPhase][currentRole].push(task);
        }
    }

    // Output
    console.log('# Incomplete Tasks Report\n');

    for (const [phase, roles] of Object.entries(data)) {
        console.log(`## ${phase}\n`);
        for (const [role, tasks] of Object.entries(roles)) {
            if (tasks.length > 0) {
                console.log(`### ${role}`);
                tasks.forEach(t => console.log(`- ${t}`));
                console.log('');
            }
        }
        console.log('---\n');
    }
}

main().catch(console.error);
