import admin from 'firebase-admin';

let initialized = false;

function initFirebase() {
  if (initialized) return;
  const adminKey = process.env.FIREBASE_ADMIN_KEY;
  if (!adminKey) throw new Error('FIREBASE_ADMIN_KEY environment variable is not set');
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(adminKey)),
  });
  initialized = true;
}

/**
 * Sends a push notification to Jay's device with the QA report summary.
 * deviceToken: FCM registration token stored as JAY_FCM_TOKEN secret.
 */
export async function sendPushNotification(deviceToken, report) {
  initFirebase();

  const scoreMatch = report.match(/Health Score[:\s*]*(\d+)/i);
  const healthScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  const errorCountMatch = report.match(/Total Errors[:\s*]*(\d+)/i);
  const errorCount = errorCountMatch ? parseInt(errorCountMatch[1], 10) : 0;

  const summaryMatch = report.match(/SUMMARY:\s*(.+)/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : '주간 QA 리포트가 준비됐습니다.';

  const scoreLabel =
    healthScore === null ? '?' : healthScore >= 80 ? '✅' : healthScore < 60 ? '🚨' : '⚠️';
  const scoreDisplay = healthScore !== null ? `${healthScore}/100` : '?';

  const message = {
    token: deviceToken,
    notification: {
      title: `${scoreLabel} ESL Game Lab QA — Health ${scoreDisplay}`,
      body: summary,
    },
    data: {
      report: report.slice(0, 3800), // FCM data payload limit is 4 KB
      errorCount: String(errorCount),
      healthScore: String(healthScore ?? ''),
      type: 'weekly_qa_report',
      generatedAt: new Date().toISOString(),
    },
    android: {
      priority: healthScore !== null && healthScore < 60 ? 'high' : 'normal',
      notification: { channelId: 'esl_qa_reports' },
    },
    apns: {
      payload: {
        aps: {
          sound: healthScore !== null && healthScore < 60 ? 'default' : '',
          badge: errorCount,
        },
      },
    },
  };

  const result = await admin.messaging().send(message);
  console.log('Push notification sent, message ID:', result);
  return result;
}
