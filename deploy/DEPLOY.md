# MeghSetu Deployment Playbook

This document details the production deployment process for MeghSetu.
- **Backend**: AWS Lightsail Container Services (`ap-south-1` Mumbai, `micro` power, scale 1).
- **Frontend**: Vercel (Next.js 16 App Router).

---

## 1. Secrets & Token Generation

Generate a cryptographically secure 32-character admin token. Use this exact command:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Save this value securely. You will use it as:
- `ADMIN_TOKEN` in Lightsail Container Service
- `ADMIN_TOKEN` in Vercel Project Settings (Server-only, no `NEXT_PUBLIC_` prefix)

---

## 2. Deployment Sequence & Architecture Order

To prevent circular configuration dependencies:
1. **Choose Vercel Project Name First**:
   - Determine your production domain on Vercel (e.g., `https://meghsetu.vercel.app`).
   - This defines your `ALLOWED_ORIGINS` for the backend.
2. **Deploy Backend to AWS Lightsail**:
   - Configure `ALLOWED_ORIGINS=https://meghsetu.vercel.app`.
   - Configure `ADMIN_TOKEN=<generated_token>`.
   - AWS Lightsail automatically provisions a managed TLS/HTTPS endpoint (e.g., `https://meghsetu-service.xyz.ap-south-1.cs.amazonlightsail.com`).
3. **Deploy Frontend to Vercel**:
   - Set Root Directory to `app_build/frontend`.
   - Set Environment Variables:
     - `NEXT_PUBLIC_API_URL=https://meghsetu-service.xyz.ap-south-1.cs.amazonlightsail.com` (Must use `https://`)
     - `ADMIN_TOKEN=<generated_token>` (Server-only)
   - Trigger deployment on Vercel.
4. **Run Smoke Test**:
   - Execute `python scripts/smoke_test.py --api-url <LIGHTSAIL_URL> --frontend-url <VERCEL_URL> --token <TOKEN>`.

---

## 3. AWS Lightsail Containers (Backend Deployment)

### Prerequisites
- AWS CLI configured with permissions for Amazon Lightsail.
- `lightsailctl` plugin installed ([Installation Guide](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-install-software)).
- Docker installed and running locally.

### Step 3.1: Build Container Image
From the repository root:

```bash
docker build --platform linux/amd64 -f app_build/backend/Dockerfile -t meghsetu-api:latest ./app_build/backend
```

### Step 3.2: Create Lightsail Container Service
Run the service creation in `ap-south-1` with `micro` power (1 GB RAM, 0.25 vCPU, perfectly sized for MeghSetu's ~180MB peak workload with 4x headroom):

```bash
aws lightsail create-container-service \
  --service-name meghsetu-service \
  --power micro \
  --scale 1 \
  --region ap-south-1
```

Verify service status until it transitions from `PENDING` to `READY`:

```bash
aws lightsail get-container-services --service-name meghsetu-service --region ap-south-1
```

### Step 3.3: Push Docker Image via lightsailctl
Push the local container image to your Lightsail service:

```bash
aws lightsail push-container-image \
  --service-name meghsetu-service \
  --label api \
  --image meghsetu-api:latest \
  --region ap-south-1
```

Note the output image reference (e.g. `:meghsetu-service.api.1`).

### Step 3.4: Deploy Container & Public Endpoint
1. Update `deploy/containers.json` with your real `image` reference and environment variables:
   - `image`: `:meghsetu-service.api.<version>`
   - `ADMIN_TOKEN`: `<your-32-char-token>`
   - `ALLOWED_ORIGINS`: `https://YOUR_VERCEL_PROJECT.vercel.app`
2. Apply the deployment configuration:

```bash
aws lightsail create-container-service-deployment \
  --service-name meghsetu-service \
  --containers file://deploy/containers.json \
  --public-endpoint file://deploy/public-endpoint.json \
  --region ap-south-1
```

### Step 3.5: Read HTTPS Endpoint URL
Retrieve the assigned HTTPS endpoint:

```bash
aws lightsail get-container-services \
  --service-name meghsetu-service \
  --region ap-south-1 \
  --query "containerServices[0].url" \
  --output text
```

Verify the health check responds with HTTP 200:

```bash
curl -I https://<assigned-url>/health
```

### Step 3.6: Redeploying Updates
To redeploy newer versions:
1. Rebuild image: `docker build --platform linux/amd64 -f app_build/backend/Dockerfile -t meghsetu-api:latest ./app_build/backend`
2. Push image: `aws lightsail push-container-image --service-name meghsetu-service --label api --image meghsetu-api:latest --region ap-south-1`
3. Update `deploy/containers.json` with the new image tag.
4. Execute `aws lightsail create-container-service-deployment` as in Step 3.4.

---

## 4. Vercel Frontend Deployment

1. **Import Repository**:
   - Go to [vercel.com](https://vercel.com) and import the repository.
2. **Configure Root Directory**:
   - In Project Settings > General > **Root Directory**, set: `app_build/frontend`
3. **Environment Variables**:
   Add the following in Vercel Settings > Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://<YOUR_LIGHTSAIL_URL>` *(MUST start with `https://`)*
   - `ADMIN_TOKEN`: `<same_token_as_backend>` *(DO NOT prefix with NEXT_PUBLIC_)*
4. **Deploy**:
   - Click **Deploy**. Vercel will run `npm run build` and launch the app.

---

## 5. Storage & Persistence Note

> **Important Operational Note:** AWS Lightsail Container Services do not provide persistent local block storage.
> - The container uses an in-memory / local SQLite database initialized at `/app/data/weather_platform.db`.
> - On cold starts, the application automatically builds tables and seeds 180 realistic benchmark records.
> - Any citizen reports or media uploaded during an active session reside on ephemeral container disk. If the container is restarted or updated, the database resets to the clean seeded state.
> - For multi-year production data retention, configure `DATABASE_URL` to an external PostgreSQL / TimescaleDB instance (e.g. AWS RDS or Supabase).

---

## 6. Submission Freeze Protocol

Once deployed and validated for the hackathon screening window:
- **FREEZE DEPLOYMENTS**: Do not push subsequent commits or trigger redeployments while evaluators are testing the platform.
- Evaluator test observations submitted during their review sessions remain intact on the running instance as long as no redeploy or service recreation is triggered.
