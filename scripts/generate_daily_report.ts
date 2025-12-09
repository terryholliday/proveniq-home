
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const STATUS_FILE = path.join(DOCS_DIR, 'ecosystem_status.md');
const REPORT_FILE = path.join(DOCS_DIR, `daily_report_${new Date().toISOString().split('T')[0]}.md`);

interface StatCounter {
    total: number;
    completed: number;
}

async function main() {
    if (!fs.existsSync(STATUS_FILE)) {
        console.error('Status file not found. Run init_master_tracker.ts first.');
        process.exit(1);
    }

    const content = fs.readFileSync(STATUS_FILE, 'utf-8');
    const lines = content.split('\n');

    const stats: Record<string, StatCounter> = {};
    let currentPhase = 'General';

    let totalTasks = 0;
    let totalCompleted = 0;

    for (const line of lines) {
        if (line.startsWith('## ')) {
            currentPhase = line.replace('## ', '').trim();
            stats[currentPhase] = { total: 0, completed: 0 };
        }

        if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]')) {
            const isCompleted = line.trim().startsWith('- [x]');

            // Initialize if needed (e.g. if no phase header was hit yet)
            if (!stats[currentPhase]) stats[currentPhase] = { total: 0, completed: 0 };

            stats[currentPhase].total++;
            totalTasks++;

            if (isCompleted) {
                stats[currentPhase].completed++;
                totalCompleted++;
            }
        }
    }

    const percentage = totalTasks > 0 ? ((totalCompleted / totalTasks) * 100).toFixed(1) : '0';

    let report = `# 📅 Daily Ecosystem Report - ${new Date().toLocaleDateString()}\n\n`;
    report += `**Overall Progress:** ${totalCompleted}/${totalTasks} tasks completed (**${percentage}%**)\n\n`;

    report += `## 📊 Phase Breakdown\n\n`;
    report += `| Phase | Completed | Total | %\n`;
    report += `|-------|-----------|-------|---\n`;

    for (const [phase, data] of Object.entries(stats)) {
        const p = data.total > 0 ? ((data.completed / data.total) * 100).toFixed(0) : '0';
        report += `| ${phase} | ${data.completed} | ${data.total} | ${p}%\n`;
    }

    report += `\n## 📝 Detailed Status\n`;
    report += `See [ecosystem_status.md](./ecosystem_status.md) for the live tracker.\n`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated: ${REPORT_FILE}`);
    console.log(report);
}

main().catch(console.error);
