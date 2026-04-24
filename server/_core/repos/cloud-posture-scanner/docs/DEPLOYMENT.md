# 🚀 Deployment Guide — Cloud Posture Scanner

Complete step-by-step instructions to deploy the Cloud Posture Scanner on AWS Free Tier.
Estimated time: **30–45 minutes**

---

## Prerequisites

- AWS account (Free Tier is sufficient)
- AWS Console access (no CLI required)
- Basic familiarity with AWS Console navigation

---

## Step 1 — Create IAM Role for Lambda

1. Open **AWS Console** → search **IAM** → click **Roles** → **Create role**
2. **Trusted entity type**: AWS service
3. **Use case**: Lambda → click **Next**
4. Click **Create policy** (opens new tab)
   - Choose **JSON** tab
   - Paste the contents of `iac/iam_policy.json`
   - Policy name: `CloudPostureScannerPolicy`
   - Click **Create policy**
5. Back on the role page — refresh and search for `CloudPostureScannerPolicy` → select it → **Next**
6. **Role name**: `CloudPostureScannerRole`
7. Click **Create role** ✅

---

## Step 2 — Create DynamoDB Table

1. Open **AWS Console** → search **DynamoDB** → **Create table**
2. Fill in:
   - **Table name**: `scan_results`
   - **Partition key**: `resource_id` (type: String)
   - **Sort key**: `timestamp` (type: String)
3. **Table settings**: Customize settings
4. **Capacity mode**: On-demand ← (cheapest for low traffic, stays free tier)
5. Leave all other settings as default
6. Click **Create table** ✅

---

## Step 3 — Deploy Lambda Functions

Repeat these steps for **each of the 4 Lambda functions** below.

### For each function:

1. Open **AWS Console** → search **Lambda** → **Create function**
2. **Author from scratch**
3. Fill in the details from the table below
4. **Execution role**: Use an existing role → select `CloudPostureScannerRole`
5. Click **Create function**
6. In the **Code** tab → paste the contents of the corresponding `lambda_function.py`
7. Click **Deploy**

| Function Name | File | Timeout |
|---------------|------|---------|
| `discover_ec2_lambda` | `lambdas/discover_ec2/lambda_function.py` | 10s |
| `discover_s3_lambda` | `lambdas/discover_s3/lambda_function.py` | 15s |
| `run_cis_checks_lambda` | `lambdas/run_cis_checks/lambda_function.py` | **30s** |
| `get_results_lambda` | `lambdas/get_results/lambda_function.py` | 10s |

### Set Timeout for each function:
- Go to **Configuration** tab → **General configuration** → **Edit**
- Set **Timeout** to the value in the table above → **Save**

### Set Environment Variables (for `run_cis_checks_lambda` and `get_results_lambda`):
- Go to **Configuration** tab → **Environment variables** → **Edit** → **Add variable**
- Key: `DYNAMODB_TABLE`, Value: `scan_results`
- Key: `AWS_REGION_TARGET`, Value: `us-east-1` (or your region)
- Click **Save**

### Test each Lambda:
- Click **Test** tab → **Create new event** → use `{}` as the event body → **Test**
- Confirm response has `statusCode: 200`

---

## Step 4 — Create API Gateway

1. Open **AWS Console** → search **API Gateway** → **Create API**
2. Choose **REST API** (not private) → **Build**
3. Settings:
   - **API name**: `CloudPostureScannerAPI`
   - **Endpoint Type**: Regional
4. Click **Create API** ✅

### Create 4 endpoints:

#### Endpoint 1: GET /instances

1. **Actions** → **Create Resource**
   - Resource name: `instances`, path: `/instances`
   - ✅ Enable API Gateway CORS
   - **Create Resource**
2. With `/instances` selected → **Actions** → **Create Method** → **GET** → ✓
3. Integration type: **Lambda Function**
4. ✅ Use Lambda Proxy Integration
5. Lambda function: `discover_ec2_lambda`
6. Click **Save** → **OK** on permissions popup

#### Endpoint 2: GET /buckets

Repeat above steps with:
- Resource name: `buckets`, path: `/buckets`
- Lambda function: `discover_s3_lambda`

#### Endpoint 3: GET /cis-results

Repeat with:
- Resource name: `cis-results`, path: `/cis-results`
- Lambda function: `get_results_lambda`

#### Endpoint 4: POST /scan

1. **Actions** → **Create Resource**
   - Resource name: `scan`, path: `/scan`
   - ✅ Enable API Gateway CORS
   - **Create Resource**
2. With `/scan` selected → **Actions** → **Create Method** → **POST** → ✓
3. Integration type: Lambda Function with Proxy → `run_cis_checks_lambda`

### Enable CORS on each resource:

For each resource (`/instances`, `/buckets`, `/cis-results`, `/scan`):
1. Select the resource
2. **Actions** → **Enable CORS**
3. Leave defaults → **Enable CORS and replace existing CORS headers** → **Yes**

### Deploy the API:

1. **Actions** → **Deploy API**
2. **Deployment stage**: [New Stage] → Stage name: `prod`
3. Click **Deploy**
4. 📋 **Copy the Invoke URL** — you will need this for the frontend!
   - It looks like: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod`

---

## Step 5 — Deploy Frontend Dashboard

1. Open **AWS Console** → search **S3** → **Create bucket**
2. Settings:
   - **Bucket name**: `cloud-posture-dashboard-yourname` (must be globally unique)
   - **Region**: same as your Lambda region
   - ❌ **Uncheck** "Block all public access" → confirm the warning checkbox
3. Click **Create bucket**
4. Click into your new bucket → **Upload** → **Add files** → select `frontend/index.html`
5. Click **Upload**

### Enable Static Website Hosting:

1. Click the bucket → **Properties** tab
2. Scroll to **Static website hosting** → **Edit**
3. Enable → set **Index document**: `index.html` → **Save changes**

### Add Bucket Policy:

1. Click **Permissions** tab → **Bucket policy** → **Edit**
2. Paste (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. Click **Save changes**

### Access your dashboard:

1. Go to **Properties** → **Static website hosting**
2. Click the **Bucket website endpoint** URL
3. Paste your **API Gateway Invoke URL** into the input field
4. Click **Run Scan** 🎉

---

## Step 6 — Verify Everything Works

| Test | Expected Result |
|------|----------------|
| GET `/instances` | Returns `{"instances": [...], "count": N}` |
| GET `/buckets` | Returns `{"buckets": [...], "count": N}` |
| GET `/cis-results` | Returns `{"results": [...]}` (empty before first scan) |
| POST `/scan` | Returns `{"results": [...], "summary": {...}}` |
| Dashboard | Shows all 3 tables populated after scan |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Lambda timeout | Increase timeout in Configuration → General configuration |
| CORS error in browser | Re-run Enable CORS on API Gateway and redeploy |
| DynamoDB access denied | Verify IAM policy has `dynamodb:*` on `scan_results` table |
| Empty EC2/S3 results | Normal if account has no resources in that region |
| 502 Bad Gateway | Check Lambda logs in CloudWatch for Python errors |
| Frontend shows error | Check that API URL ends with `/prod` (no trailing slash) |
