# Automated Deployment Setup Guide

This guide will help you set up automated deployment from GitHub to Google Cloud Run.

## Prerequisites

1. **Google Cloud Project** with billing enabled
2. **Cloud Run API** enabled
3. **Artifact Registry API** enabled
4. **GitHub repository** with admin access

## Step-by-Step Setup

### 1. Create Google Cloud Service Account

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"

# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment" \
  --project=$PROJECT_ID

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com

# The key.json file will be used in GitHub Secrets
```

### 2. Create Artifact Registry Repository

```bash
# Create repository for Docker images
gcloud artifacts repositories create esl-game-lab \
  --repository-format=docker \
  --location=us-central1 \
  --description="ESL Game Lab Docker images"
```

### 3. Configure GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `GCP_PROJECT_ID` | Your Google Cloud Project ID | Found in GCP Console |
| `GCP_SA_KEY` | Service account JSON key | Content of `key.json` from step 1 |
| `GEMINI_API_KEY` | Your Gemini API key | From Google AI Studio |

**Important**:
- For `GCP_SA_KEY`, paste the **entire content** of the `key.json` file
- Keep the `key.json` file secure and delete it after adding to GitHub

### 4. Create Secret in Google Cloud Secret Manager (for runtime)

```bash
# Create secret for Gemini API key
echo -n "your-gemini-api-key-here" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

# Grant Cloud Run service account access to the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 5. Update Workflow Configuration (if needed)

If you want to change deployment settings, edit `.github/workflows/deploy-to-cloud-run.yml`:

- **Region**: Default is `us-central1` (change in `env.REGION`)
- **Memory**: Default is `512Mi` (change in `--memory` flag)
- **CPU**: Default is `1` (change in `--cpu` flag)
- **Scaling**: Min 0, Max 10 instances (change `--min-instances` and `--max-instances`)

### 6. Custom Domain Setup (Optional)

To use `esl-game-lab.com`:

```bash
# Map your domain to Cloud Run
gcloud run services update esl-game-lab \
  --platform managed \
  --region us-central1 \
  --set-env-vars="DOMAIN=esl-game-lab.com"

# Add domain mapping
gcloud run domain-mappings create \
  --service esl-game-lab \
  --domain esl-game-lab.com \
  --region us-central1

# Follow DNS instructions provided by the command above
```

## How It Works

### Automated Deployment Flow

```
Push to main/master
    ↓
GitHub Actions triggered
    ↓
Build Docker image
    ↓
Push to Artifact Registry
    ↓
Deploy to Cloud Run
    ↓
Health check
    ↓
Live at esl-game-lab.com ✅
```

### Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Cloud Run** workflow
3. Click **Run workflow**

## Monitoring & Logs

- **Cloud Run logs**: `gcloud run services logs read esl-game-lab --region=us-central1`
- **Deployment status**: Check the Actions tab in GitHub
- **Cloud Console**: https://console.cloud.google.com/run

## Troubleshooting

### Build fails
- Check GitHub Actions logs
- Verify `package.json` dependencies are correct
- Ensure Dockerfile is in `esl-game-lab (1)/` directory

### Deployment fails
- Verify service account has correct permissions
- Check Cloud Run quotas in GCP Console
- Ensure Artifact Registry repository exists

### App doesn't work after deployment
- Check Cloud Run logs for runtime errors
- Verify `VITE_GEMINI_API_KEY` secret is configured
- Test the health check endpoint

### Domain not working
- Verify DNS records are correctly configured
- Wait for DNS propagation (can take up to 48 hours)
- Check domain mapping status: `gcloud run domain-mappings list`

## Security Best Practices

✅ **Never commit** `key.json` or API keys to the repository
✅ **Use Secret Manager** for sensitive runtime configuration
✅ **Rotate service account keys** periodically
✅ **Review IAM permissions** regularly
✅ **Enable VPC Service Controls** for production

## Cost Optimization

The current configuration is optimized for cost:
- **Min instances: 0** - No cost when idle
- **512Mi memory** - Sufficient for the app
- **Auto-scaling** - Only pay for what you use

Estimated cost: **~$5-20/month** depending on traffic

---

**Questions?** Check the GitHub Actions logs or Cloud Run documentation.
