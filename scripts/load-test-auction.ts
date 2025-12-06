/**
 * Auction Load Test Script
 * 
 * Simulates 500 concurrent users placing bids on a single auction.
 * Measures p95/p99 latency and tracks Firestore transaction conflicts.
 * 
 * Usage:
 *   npx ts-node scripts/load-test-auction.ts --auctionId=<AUCTION_ID> [--users=500] [--duration=60]
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

interface LoadTestConfig {
    auctionId: string;
    concurrentUsers: number;
    testDurationSeconds: number;
    rampUpSeconds: number;
    bidIncrementMin: number;
    bidIncrementMax: number;
}

interface BidResult {
    userId: string;
    success: boolean;
    latencyMs: number;
    error?: string;
    bidAmount?: number;
    timestamp: number;
}

interface LoadTestReport {
    config: LoadTestConfig;
    startTime: string;
    endTime: string;
    totalBids: number;
    successfulBids: number;
    failedBids: number;
    conflictCount: number;
    latencyStats: {
        min: number;
        max: number;
        mean: number;
        p50: number;
        p95: number;
        p99: number;
    };
    bidResults: BidResult[];
}

function calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

async function simulateBid(
    auctionId: string,
    userId: string,
    bidAmount: number
): Promise<BidResult> {
    const startTime = Date.now();
    const result: BidResult = {
        userId,
        success: false,
        latencyMs: 0,
        timestamp: startTime,
    };

    try {
        const auctionRef = db.collection('auctions').doc(auctionId);

        await db.runTransaction(async (tx) => {
            const auctionSnap = await tx.get(auctionRef);

            if (!auctionSnap.exists) {
                throw new Error('Auction not found');
            }

            const auction = auctionSnap.data() as {
                currentBid?: number;
                startingBid?: number;
                status?: string;
            };

            if (auction.status !== 'live') {
                throw new Error('Auction is not live');
            }

            const currentBid = auction.currentBid || auction.startingBid || 0;

            if (bidAmount <= currentBid) {
                throw new Error(`Bid ${bidAmount} must be higher than current ${currentBid}`);
            }

            // Create bid document
            const bidRef = auctionRef.collection('bids').doc();
            tx.set(bidRef, {
                bidderUid: userId,
                amount: bidAmount,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Update auction current bid
            tx.update(auctionRef, {
                currentBid: bidAmount,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        result.success = true;
        result.bidAmount = bidAmount;
    } catch (error) {
        result.error = (error as Error).message;
    }

    result.latencyMs = Date.now() - startTime;
    return result;
}

async function runLoadTest(config: LoadTestConfig): Promise<LoadTestReport> {
    console.log('\n' + '='.repeat(60));
    console.log('AUCTION LOAD TEST');
    console.log('='.repeat(60));
    console.log(`Auction ID: ${config.auctionId}`);
    console.log(`Concurrent Users: ${config.concurrentUsers}`);
    console.log(`Duration: ${config.testDurationSeconds}s`);
    console.log('='.repeat(60) + '\n');

    const bidResults: BidResult[] = [];
    const startTime = Date.now();
    const endTime = startTime + (config.testDurationSeconds * 1000);

    // Get initial bid
    const auctionSnap = await db.collection('auctions').doc(config.auctionId).get();
    if (!auctionSnap.exists) {
        throw new Error(`Auction ${config.auctionId} not found`);
    }

    let currentBid = auctionSnap.data()?.currentBid || auctionSnap.data()?.startingBid || 10;

    // Ramp up users
    const usersPerSecond = Math.ceil(config.concurrentUsers / config.rampUpSeconds);
    let activeUsers = 0;

    const userLoop = async (userId: string) => {
        while (Date.now() < endTime) {
            // Calculate bid amount with random increment
            const increment = Math.floor(
                Math.random() * (config.bidIncrementMax - config.bidIncrementMin) + config.bidIncrementMin
            );
            currentBid += increment;

            const result = await simulateBid(config.auctionId, userId, currentBid);
            bidResults.push(result);

            // Log progress periodically
            if (bidResults.length % 100 === 0) {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`[${elapsed}s] ${bidResults.length} bids (${bidResults.filter(r => r.success).length} successful)`);
            }

            // Random delay between bids (100-500ms)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
        }
    };

    // Start users gradually
    const userPromises: Promise<void>[] = [];

    for (let i = 0; i < config.concurrentUsers; i++) {
        const userId = `loadtest_user_${i.toString().padStart(4, '0')}`;
        userPromises.push(userLoop(userId));
        activeUsers++;

        if (activeUsers % usersPerSecond === 0 && activeUsers < config.concurrentUsers) {
            console.log(`Ramping up: ${activeUsers}/${config.concurrentUsers} users active`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`All ${config.concurrentUsers} users active. Running for ${config.testDurationSeconds}s...`);

    await Promise.all(userPromises);

    // Calculate statistics
    const successfulBids = bidResults.filter(r => r.success);
    const failedBids = bidResults.filter(r => !r.success);
    const conflicts = failedBids.filter(r => r.error?.includes('higher than current'));

    const latencies = successfulBids.map(r => r.latencyMs);

    const report: LoadTestReport = {
        config,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        totalBids: bidResults.length,
        successfulBids: successfulBids.length,
        failedBids: failedBids.length,
        conflictCount: conflicts.length,
        latencyStats: {
            min: latencies.length > 0 ? Math.min(...latencies) : 0,
            max: latencies.length > 0 ? Math.max(...latencies) : 0,
            mean: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
            p50: calculatePercentile(latencies, 50),
            p95: calculatePercentile(latencies, 95),
            p99: calculatePercentile(latencies, 99),
        },
        bidResults,
    };

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('LOAD TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Bids: ${report.totalBids}`);
    console.log(`Successful: ${report.successfulBids} (${(report.successfulBids / report.totalBids * 100).toFixed(1)}%)`);
    console.log(`Failed: ${report.failedBids}`);
    console.log(`Transaction Conflicts: ${report.conflictCount}`);
    console.log('\nLatency Statistics (ms):');
    console.log(`  Min: ${report.latencyStats.min.toFixed(0)}`);
    console.log(`  Max: ${report.latencyStats.max.toFixed(0)}`);
    console.log(`  Mean: ${report.latencyStats.mean.toFixed(0)}`);
    console.log(`  P50: ${report.latencyStats.p50.toFixed(0)}`);
    console.log(`  P95: ${report.latencyStats.p95.toFixed(0)}`);
    console.log(`  P99: ${report.latencyStats.p99.toFixed(0)}`);

    // Check against SLA
    const slaTarget = 100; // <100ms target from implementation plan
    if (report.latencyStats.p95 <= slaTarget) {
        console.log(`\n✅ P95 latency (${report.latencyStats.p95.toFixed(0)}ms) meets <${slaTarget}ms target`);
    } else {
        console.log(`\n❌ P95 latency (${report.latencyStats.p95.toFixed(0)}ms) exceeds <${slaTarget}ms target`);
    }

    console.log('='.repeat(60) + '\n');

    return report;
}

// CLI Execution
async function main() {
    const args = process.argv.slice(2);

    const auctionIdArg = args.find(a => a.startsWith('--auctionId='));
    const usersArg = args.find(a => a.startsWith('--users='));
    const durationArg = args.find(a => a.startsWith('--duration='));

    if (!auctionIdArg) {
        console.error('Usage: npx ts-node scripts/load-test-auction.ts --auctionId=<AUCTION_ID> [--users=500] [--duration=60]');
        process.exit(1);
    }

    const config: LoadTestConfig = {
        auctionId: auctionIdArg.split('=')[1],
        concurrentUsers: usersArg ? parseInt(usersArg.split('=')[1]) : 500,
        testDurationSeconds: durationArg ? parseInt(durationArg.split('=')[1]) : 60,
        rampUpSeconds: 10,
        bidIncrementMin: 5,
        bidIncrementMax: 50,
    };

    try {
        const report = await runLoadTest(config);

        // Save report to file
        const fs = await import('fs');
        const reportPath = `./load-test-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`Report saved to: ${reportPath}`);

    } catch (error) {
        console.error('Load test failed:', error);
        process.exit(1);
    }
}

main();
