# 🛡️ Cloud Posture Scanner

> A lightweight, serverless AWS Security Posture Management tool that automatically discovers cloud resources and runs **CIS AWS Benchmark** security checks — built entirely on AWS Free Tier.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Deploy (1-Click CloudFormation)](#quick-deploy)
- [API Documentation](#api-documentation)
- [CIS Benchmark Checks](#cis-benchmark-checks)
- [Security Design](#security-design)
- [AWS Free Tier Cost](#aws-free-tier-cost)

---

## Overview

Cloud Posture Scanner connects to your AWS account and scans for security posture issues across EC2, S3, IAM, and CloudTrail. It uses a fully serverless architecture — no servers to manage, zero cost on AWS Free Tier.

**Tech Stack:**
`AWS API Gateway` · `AWS Lambda (Python 3.12)` · `DynamoDB` · `AWS SDK (boto3)` · `CloudFormation` · `S3 Static Hosting`

---

## Architecture

```
Client (Browser / Postman)
         │
         │  HTTPS
         ▼
  ┌─────────────────────────────────────────────┐
  │             AWS API Gateway                  │
  │  GET /instances  GET /buckets               │
  │  GET /cis-results  POST /scan               │
  └──────┬──────────┬──────────┬──────────┬─────┘
         │          │          │          │
         ▼          ▼          ▼          ▼
   discover_   discover_  get_results  run_cis_
   ec2_lambda  s3_lambda   _lambda    checks_lambda
         │          │                    │
         ▼          ▼                    ▼
      EC2 API    S3 API          EC2 + S3 + IAM
                              + CloudTrail APIs
                                         │
                    ┌────────────────────┘
                    ▼
              ┌──────────────┐
              │   DynamoDB   │
              │ scan_results │
              └──────────────┘

IAM Role: CloudPostureScannerRole (least-privilege)
No hardcoded credentials — Lambda uses execution role
```

See full diagram: [docs/architecture-diagram.svg](docs/architecture-diagram.svg)

---

## Features

| Feature | Details |
|---------|---------|
| **EC2 Discovery** | Instance ID, Type, Region, Public IP, State, Security Groups |
| **S3 Discovery** | Bucket name, Region, Encryption status, Public/Private access |
| **CIS Check 1** | S3 buckets should not be publicly accessible |
| **CIS Check 2** | S3 buckets must have server-side encryption enabled |
| **CIS Check 3** | IAM root account must have MFA enabled |
| **CIS Check 4** | CloudTrail must be enabled and actively logging |
| **CIS Check 5** | Security groups must not allow SSH/RDP from 0.0.0.0/0 |
| **Dashboard** | Single-file HTML frontend — no build step required |
| **1-Click Deploy** | Full CloudFormation template — deploys 25 resources automatically |

---

## Project Structure

```
cloud-posture-scanner/
│
├── README.md                          ← You are here
│
├── iac/
│   ├── cloudformation.yaml            ← ONE-CLICK deploy (all resources)
│   └── iam_policy.json                ← Standalone IAM policy reference
│
├── lambdas/
│   ├── discover_ec2/
│   │   └── lambda_function.py         ← EC2 instance discovery
│   ├── discover_s3/
│   │   └── lambda_function.py         ← S3 bucket discovery + security metadata
│   ├── run_cis_checks/
│   │   └── lambda_function.py         ← All 5 CIS benchmark checks + DynamoDB write
│   └── get_results/
│       └── lambda_function.py         ← Read stored results from DynamoDB
│
├── frontend/
│   └── index.html                     ← Dashboard UI (upload to S3)
│
└── docs/
    ├── DEPLOYMENT.md                  ← Step-by-step manual deployment guide
    ├── API.md                         ← Full REST API documentation
    ├── DEMO.md                        ← Demo walkthrough script
    └── architecture-diagram.svg       ← Architecture diagram
```

---

## Quick Deploy

Deploy everything in **~3 minutes** using CloudFormation.

### What CloudFormation creates automatically
- ✅ IAM Role + least-privilege policy
- ✅ DynamoDB table (`scan_results`)
- ✅ 4 Lambda functions with code embedded
- ✅ API Gateway with 4 endpoints + CORS
- ✅ API Gateway deployed to `prod` stage

### Steps

**1 — Open CloudFormation**
```
AWS Console → CloudFormation → Create Stack → With new resources
```

**2 — Upload Template**
```
Select: Upload a template file
File:   iac/cloudformation.yaml
```

**3 — Configure**

| Parameter | Value |
|-----------|-------|
| Stack name | `cloud-posture-scanner` |
| Region | `us-east-1` |
| Stage | `prod` |

**4 — Deploy**
```
Next → Next → ☑ Acknowledge IAM resources → Submit
Wait 3 minutes → Status: CREATE_COMPLETE
```

**5 — Get your API URL**
```
Click stack name → Outputs tab → copy APIGatewayURL
```
It looks like: `https://abc123.execute-api.us-east-1.amazonaws.com/prod`

**6 — Deploy Frontend**

1. Create S3 bucket → uncheck "Block all public access"
2. Upload `frontend/index.html`
3. Enable **Static website hosting** → index: `index.html`
4. Add bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
  }]
}
```

5. Open S3 website URL → paste `APIGatewayURL` → click **Run Scan** ✅

> For manual step-by-step deployment, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## API Documentation

Full docs: [docs/API.md](docs/API.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/instances` | List all EC2 instances |
| `GET` | `/buckets` | List all S3 buckets with security info |
| `GET` | `/cis-results` | Get stored CIS scan results from DynamoDB |
| `POST` | `/scan` | Trigger a fresh security scan |

**Sample — POST /scan response:**

```json
{
  "results": [
    {
      "check_id": "CIS-1.5",
      "check_name": "Root Account MFA Enabled",
      "resource": "aws-root-account",
      "resource_type": "IAM",
      "status": "FAIL",
      "evidence": "CRITICAL: Root account MFA is NOT enabled.",
      "timestamp": "2025-03-06T10:05:22+00:00"
    }
  ],
  "summary": { "total": 8, "passed": 5, "failed": 3, "score_pct": 63 }
}
```

---

## CIS Benchmark Checks

| Check ID | Description | Resource |
|----------|-------------|----------|
| CIS-2.1.5 | S3 Bucket Not Publicly Accessible | S3 |
| CIS-2.1.1 | S3 Server-Side Encryption Enabled | S3 |
| CIS-1.5 | Root Account MFA Enabled | IAM |
| CIS-3.1 | CloudTrail Enabled and Logging | CloudTrail |
| CIS-5.2 | No Unrestricted SSH/RDP in Security Groups | EC2 |

---

## Security Design

| Principle | Implementation |
|-----------|---------------|
| No hardcoded credentials | Lambda uses IAM execution role automatically |
| Least privilege IAM | Only exact API actions needed per service |
| CORS | Enabled on all API Gateway routes |
| DynamoDB encryption | Server-side encryption enabled by default |
| Environment variables | Region and table name via env vars, not hardcoded |

---

## AWS Free Tier Cost

| Service | Free Tier Limit | Cost |
|---------|----------------|------|
| Lambda | 1M requests/month | **$0** |
| API Gateway | 1M calls/month | **$0** |
| DynamoDB | 25 WCU/RCU + 25 GB | **$0** |
| S3 (frontend) | 5 GB + 20K requests | **$0** |

**Total: $0/month**

> To remove everything: CloudFormation → select stack → **Delete**
