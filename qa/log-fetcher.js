import { Logging } from '@google-cloud/logging';

/**
 * Fetches Cloud Run error logs for esl-game-lab-api from the past N hours.
 * Requires Application Default Credentials (set via gcloud auth or GCP_SA_KEY).
 */
export async function fetchRecentErrors(projectId, hoursBack = 168) {
  const logging = new Logging({ projectId });
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const filter = [
    'resource.type="cloud_run_revision"',
    'resource.labels.service_name="esl-game-lab-api"',
    'severity>=ERROR',
    `timestamp>="${cutoff.toISOString()}"`,
  ].join(' AND ');

  const [entries] = await logging.getEntries({
    filter,
    orderBy: 'timestamp desc',
    pageSize: 200,
    resourceNames: [`projects/${projectId}`],
  });

  return entries.map(entry => ({
    timestamp: entry.metadata.timestamp,
    severity: entry.metadata.severity,
    message: extractMessage(entry),
    httpRequest: entry.metadata.httpRequest || null,
    labels: entry.metadata.labels || {},
  }));
}

function extractMessage(entry) {
  if (typeof entry.data === 'string') return entry.data;
  if (entry.data?.message) return entry.data.message;
  if (entry.data?.textPayload) return entry.data.textPayload;
  try {
    return JSON.stringify(entry.data);
  } catch {
    return String(entry.data);
  }
}
