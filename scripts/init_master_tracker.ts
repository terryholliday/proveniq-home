import fs from 'fs';
import path from 'path';

// Types for our different task structures
interface SimpleRoleDef {
    phase: number;
    agent_name: string;
    tasks: string[];
}

interface ComplexTask {
    title: string;
    description: string;
    security_level?: string;
    data_source?: string;
}

interface ComplexRoleDef {
    id: string;
    title: string;
    tasks: ComplexTask[];
}

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const OUT_FILE = path.join(DOCS_DIR, 'ecosystem_status.md');

// Source paths
const PHASE_DIRS = ['phase-3', 'phase-4', 'phase-5'];
const TRUE_MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'lib', 'true_manifest_roles.json');

async function main() {
    let markdown = '# MyARK Ecosystem - Master Task Tracker\n\n';
    markdown += `**Last Updated:** ${new Date().toISOString().split('T')[0]}\n`;
    markdown += `**Status:** Living Document tracked by Agent.\n\n`;

    // 1. Process TrueManifest Roles (Phase 4 Detailed)
    if (fs.existsSync(TRUE_MANIFEST_PATH)) {
        markdown += '## 🚀 Phase 4: TrueManifest Integration (High Priority)\n\n';
        const content = fs.readFileSync(TRUE_MANIFEST_PATH, 'utf-8');
        const roles: ComplexRoleDef[] = JSON.parse(content);

        for (const role of roles) {
            markdown += `### ${role.title}\n`;
            for (const task of role.tasks) {
                // Check if this task looks like the one we just did
                const isAuction = task.title.toLowerCase().includes('auction') || task.title.toLowerCase().includes('webhook');
                const check = isAuction ? '[x]' : '[ ]';
                markdown += `- ${check} **${task.title}**\n`;
                markdown += `  - ${task.description}\n`;
                if (task.security_level) markdown += `  - *Security:* \`${task.security_level}\`\n`;
            }
            markdown += '\n';
        }
    }

    // 2. Process Phase Directories
    for (const phaseDir of PHASE_DIRS) {
        const dirPath = path.join(ROOT_DIR, phaseDir);
        if (!fs.existsSync(dirPath)) continue;

        const phaseNum = phaseDir.split('-')[1];
        markdown += `## 📦 Phase ${phaseNum} Roles\n\n`;

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

        for (const file of files) {
            const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
            try {
                const role: SimpleRoleDef = JSON.parse(content);
                markdown += `### ${role.agent_name}\n`;
                for (const task of role.tasks) {
                    markdown += `- [ ] ${task}\n`;
                }
                markdown += '\n';
            } catch (e) {
                console.error(`Failed to parse ${file}:`, e);
            }
        }
    }

    // Write to file
    if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR);
    fs.writeFileSync(OUT_FILE, markdown);
    console.log(`Successfully generated ${OUT_FILE}`);
}

main().catch(console.error);
