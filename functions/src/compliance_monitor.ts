import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

interface ComplianceTask {
    id: string;
    title: string;
    description?: string;
    dueDate: Timestamp;
    status: "pending" | "in_progress" | "completed" | "overdue";
    priority: "low" | "medium" | "high" | "critical";
    assignedTo?: string;
    tags?: string[];
    notificationsSent?: number;
}

/**
 * Compliance Task Monitor
 * 
 * Runs daily at 9:00 AM UTC to:
 * 1. Check for upcoming tax deadlines
 * 2. Mark overdue tasks
 * 3. Send notifications for approaching deadlines
 * 
 * Monitored deadline types:
 * - 1099-K filing (Jan 31)
 * - State sales tax remittance (varies)
 * - SOC 2 audit renewals
 * - Privacy policy review
 */
export const monitorComplianceTasks = onSchedule(
    {
        schedule: "0 9 * * *", // Daily at 9:00 AM UTC
        timeZone: "America/New_York",
        retryCount: 3,
    },
    async (_event) => {
        logger.info("Starting compliance task monitor");

        const now = Timestamp.now();
        const sevenDaysFromNow = Timestamp.fromDate(
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );
        const thirtyDaysFromNow = Timestamp.fromDate(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

        try {
            // 1. Mark overdue tasks
            const overdueResult = await markOverdueTasks(now);
            logger.info(`Marked ${overdueResult} tasks as overdue`);

            // 2. Get tasks due in next 7 days (critical alerts)
            const criticalTasks = await getUpcomingTasks(now, sevenDaysFromNow);
            if (criticalTasks.length > 0) {
                await sendCriticalAlerts(criticalTasks);
                logger.warn(`${criticalTasks.length} critical deadlines approaching`);
            }

            // 3. Get tasks due in 7-30 days (reminder alerts)
            const reminderTasks = await getUpcomingTasks(sevenDaysFromNow, thirtyDaysFromNow);
            if (reminderTasks.length > 0) {
                await sendReminderAlerts(reminderTasks);
                logger.info(`${reminderTasks.length} reminder alerts sent`);
            }

            // 4. Log monitoring run
            await db.collection("compliance_monitor_runs").add({
                runAt: FieldValue.serverTimestamp(),
                overdueMarked: overdueResult,
                criticalAlerts: criticalTasks.length,
                reminderAlerts: reminderTasks.length,
            });

        } catch (error) {
            logger.error("Compliance monitor failed", { error });
            throw error;
        }
    }
);

async function markOverdueTasks(now: Timestamp): Promise<number> {
    const snapshot = await db.collection("compliance_tasks")
        .where("status", "in", ["pending", "in_progress"])
        .where("dueDate", "<", now)
        .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
            status: "overdue",
            updatedAt: FieldValue.serverTimestamp(),
        });
    });

    await batch.commit();
    return snapshot.size;
}

async function getUpcomingTasks(
    startDate: Timestamp,
    endDate: Timestamp
): Promise<ComplianceTask[]> {
    const snapshot = await db.collection("compliance_tasks")
        .where("status", "in", ["pending", "in_progress"])
        .where("dueDate", ">=", startDate)
        .where("dueDate", "<=", endDate)
        .orderBy("dueDate", "asc")
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as ComplianceTask[];
}

async function sendCriticalAlerts(tasks: ComplianceTask[]): Promise<void> {
    // In production, this would integrate with:
    // - Email (SendGrid/Postmark)
    // - Slack webhook
    // - PagerDuty for critical alerts

    for (const task of tasks) {
        const daysUntilDue = Math.ceil(
            (task.dueDate.toDate().getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );

        // Log alert (replace with actual notification service)
        logger.warn("CRITICAL: Compliance deadline approaching", {
            taskId: task.id,
            title: task.title,
            daysUntilDue,
            priority: task.priority,
            assignedTo: task.assignedTo,
        });

        // Update notification count
        await db.collection("compliance_tasks").doc(task.id).update({
            notificationsSent: FieldValue.increment(1),
            lastNotifiedAt: FieldValue.serverTimestamp(),
        });

        // Create notification record
        await db.collection("compliance_notifications").add({
            taskId: task.id,
            type: "critical",
            sentAt: FieldValue.serverTimestamp(),
            daysUntilDue,
            channel: "log", // Would be "email", "slack", etc.
        });
    }
}

async function sendReminderAlerts(tasks: ComplianceTask[]): Promise<void> {
    for (const task of tasks) {
        const daysUntilDue = Math.ceil(
            (task.dueDate.toDate().getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );

        // Only send reminder if not already notified this week
        const lastWeek = Timestamp.fromDate(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );

        const recentNotifications = await db.collection("compliance_notifications")
            .where("taskId", "==", task.id)
            .where("sentAt", ">", lastWeek)
            .limit(1)
            .get();

        if (recentNotifications.empty) {
            logger.info("Reminder: Compliance deadline in 30 days", {
                taskId: task.id,
                title: task.title,
                daysUntilDue,
            });

            await db.collection("compliance_notifications").add({
                taskId: task.id,
                type: "reminder",
                sentAt: FieldValue.serverTimestamp(),
                daysUntilDue,
                channel: "log",
            });
        }
    }
}

// --- Seed Initial Compliance Tasks ---

/**
 * Call this once to seed standard compliance tasks.
 * Can be triggered via Firebase CLI or Admin SDK.
 */
export async function seedComplianceTasks(): Promise<void> {
    const standardTasks = [
        {
            title: "1099-K Filing Deadline",
            description: "File 1099-K forms for all sellers with >$600 in sales",
            dueDate: Timestamp.fromDate(new Date("2025-01-31")),
            status: "pending",
            priority: "critical",
            tags: ["tax", "irs", "annual"],
        },
        {
            title: "Q1 Sales Tax Remittance",
            description: "Remit collected sales tax to applicable states",
            dueDate: Timestamp.fromDate(new Date("2025-04-20")),
            status: "pending",
            priority: "high",
            tags: ["tax", "quarterly"],
        },
        {
            title: "SOC 2 Type II Audit Renewal",
            description: "Annual SOC 2 Type II audit with external auditor",
            dueDate: Timestamp.fromDate(new Date("2025-06-30")),
            status: "pending",
            priority: "high",
            tags: ["security", "annual"],
        },
        {
            title: "Privacy Policy Annual Review",
            description: "Review and update Privacy Policy for compliance",
            dueDate: Timestamp.fromDate(new Date("2025-01-15")),
            status: "pending",
            priority: "medium",
            tags: ["privacy", "gdpr", "ccpa"],
        },
        {
            title: "BIPA Policy Review",
            description: "Annual review of biometric data handling policies",
            dueDate: Timestamp.fromDate(new Date("2025-12-01")),
            status: "pending",
            priority: "medium",
            tags: ["privacy", "bipa"],
        },
    ];

    const batch = db.batch();
    const now = FieldValue.serverTimestamp();

    for (const task of standardTasks) {
        const ref = db.collection("compliance_tasks").doc();
        batch.set(ref, {
            ...task,
            createdAt: now,
            updatedAt: now,
        });
    }

    await batch.commit();
    logger.info(`Seeded ${standardTasks.length} compliance tasks`);
}
