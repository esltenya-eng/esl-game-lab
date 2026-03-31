/**
 * ESL Game Lab — Weekly QA Orchestrator
 *
 * Schedule: Every Friday 08:00 KST (Thursday 23:00 UTC)
 * Triggered by: .github/workflows/weekly-qa.yml
 *
 * Required environment variables:
 *   GCP_PROJECT_ID      — GCP project ID for Cloud Logging
 *   ANTHROPIC_API_KEY   — Anthropic Claude API key
 *   FIREBASE_ADMIN_KEY  — Firebase Admin SDK service account JSON (stringified)
 *   JAY_FCM_TOKEN       — Jay's FCM device registration token
 */

import { fetchRecentErrors } from './log-fetcher.js';
import { analyzeErrors } from './error-analyzer.js';
import { sendPushNotification } from './notifier.js';

const REQUIRED_ENV = ['GCP_PROJECT_ID', 'ANTHROPIC_API_KEY'];

async function runWeeklyQA() {
  console.log('=== ESL Game Lab Weekly QA ===');
  console.log('Started at:', new Date().toISOString());

  // Validate required env vars
  const missing = REQUIRED_ENV.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  const projectId = process.env.GCP_PROJECT_ID;
  const deviceToken = process.env.JAY_FCM_TOKEN;

  try {
    // Step 1: Fetch last 7 days of errors from Cloud Logging
    console.log('\n[1/3] Fetching Cloud Run error logs...');
    const errors = await fetchRecentErrors(projectId);
    console.log(`Found ${errors.length} error entries`);

    // Step 2: Analyze with Claude
    console.log('\n[2/3] Analyzing errors with Claude...');
    const report = await analyzeErrors(errors);
    console.log('\n--- REPORT START ---');
    console.log(report);
    console.log('--- REPORT END ---\n');

    // Step 3: Send push notification
    console.log('[3/3] Sending push notification...');
    if (deviceToken) {
      if (!process.env.FIREBASE_ADMIN_KEY) {
        console.warn('FIREBASE_ADMIN_KEY not set — skipping push notification');
      } else {
        await sendPushNotification(deviceToken, report);
        console.log('Push notification delivered');
      }
    } else {
      console.warn('JAY_FCM_TOKEN not set — skipping push notification');
      console.log('(Report printed above for manual review)');
    }

    console.log('\n✅ Weekly QA completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ QA run failed:', error.message);
    console.error(error.stack);

    // Best-effort error notification
    if (deviceToken && process.env.FIREBASE_ADMIN_KEY) {
      try {
        const errMsg = `🚨 ESL QA 실행 실패\n${error.message.slice(0, 200)}`;
        await sendPushNotification(deviceToken, errMsg);
      } catch (notifyErr) {
        console.error('Failed to send failure notification:', notifyErr.message);
      }
    }

    process.exit(1);
  }
}

runWeeklyQA();
