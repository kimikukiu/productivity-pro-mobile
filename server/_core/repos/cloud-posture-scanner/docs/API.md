# 📡 API Documentation — Cloud Posture Scanner

**Base URL**: `https://{api-id}.execute-api.{region}.amazonaws.com/prod`

All endpoints return JSON. No authentication required (CORS enabled).

---

## Endpoints Overview

| Method | Path | Lambda | Description |
|--------|------|--------|-------------|
| GET | `/instances` | `discover_ec2_lambda` | List all EC2 instances |
| GET | `/buckets` | `discover_s3_lambda` | List all S3 buckets |
| GET | `/cis-results` | `get_results_lambda` | Get stored CIS scan results |
| POST | `/scan` | `run_cis_checks_lambda` | Trigger a fresh security scan |

---

## GET /instances

Discovers all EC2 instances in the configured region.

### Request

```
GET https://{base-url}/prod/instances
```

No request body or parameters required.

### Response 200 OK

```json
{
  "instances": [
    {
      "instance_id": "i-0abc1234def567890",
      "instance_name": "MyWebServer",
      "instance_type": "t2.micro",
      "region": "us-east-1",
      "public_ip": "54.123.45.67",
      "private_ip": "172.31.10.5",
      "state": "running",
      "security_groups": [
        { "id": "sg-0abc123", "name": "launch-wizard-1" }
      ],
      "launch_time": "2024-11-15T09:30:00+00:00",
      "ami_id": "ami-0abcdef1234567890",
      "vpc_id": "vpc-0abc12345"
    }
  ],
  "count": 1,
  "region": "us-east-1",
  "timestamp": "2025-03-06T10:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `instance_id` | string | AWS EC2 instance ID |
| `instance_name` | string | Value of the `Name` tag, or "Unnamed" |
| `instance_type` | string | EC2 instance type (e.g., `t2.micro`) |
| `region` | string | AWS region |
| `public_ip` | string\|null | Public IPv4 address, null if none |
| `private_ip` | string | Private IPv4 address |
| `state` | string | Instance state: `running`, `stopped`, etc. |
| `security_groups` | array | List of `{id, name}` objects |
| `launch_time` | string | ISO 8601 launch timestamp |
| `ami_id` | string | Amazon Machine Image ID |
| `vpc_id` | string | VPC the instance belongs to |

### Response 500 Error

```json
{
  "error": "Failed to discover EC2 instances",
  "detail": "An error occurred (AuthFailure)..."
}
```

---

## GET /buckets

Discovers all S3 buckets in the account with security metadata.

### Request

```
GET https://{base-url}/prod/buckets
```

### Response 200 OK

```json
{
  "buckets": [
    {
      "bucket_name": "my-application-bucket",
      "region": "us-east-1",
      "created": "2024-01-20T14:00:00+00:00",
      "encryption_status": "ENABLED",
      "encryption_type": "AES256",
      "access_policy": "PRIVATE",
      "public_access_config": {
        "BlockPublicAcls": true,
        "BlockPublicPolicy": true,
        "IgnorePublicAcls": true,
        "RestrictPublicBuckets": true
      }
    },
    {
      "bucket_name": "my-public-assets",
      "region": "us-west-2",
      "created": "2024-03-01T10:00:00+00:00",
      "encryption_status": "DISABLED",
      "encryption_type": "NONE",
      "access_policy": "PUBLIC",
      "public_access_config": {
        "BlockPublicAcls": false,
        "BlockPublicPolicy": false,
        "IgnorePublicAcls": false,
        "RestrictPublicBuckets": false
      }
    }
  ],
  "count": 2,
  "timestamp": "2025-03-06T10:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `bucket_name` | string | S3 bucket name |
| `region` | string | AWS region where the bucket resides |
| `created` | string | Bucket creation date (ISO 8601) |
| `encryption_status` | string | `ENABLED`, `DISABLED`, or `UNKNOWN` |
| `encryption_type` | string | `AES256`, `aws:kms`, `NONE`, or `UNKNOWN` |
| `access_policy` | string | `PRIVATE`, `PUBLIC`, or `UNKNOWN` |
| `public_access_config` | object | Raw public access block configuration |

---

## GET /cis-results

Returns all stored CIS benchmark scan results from DynamoDB.

### Request

```
GET https://{base-url}/prod/cis-results
```

### Optional Query Parameter

| Parameter | Values | Description |
|-----------|--------|-------------|
| `status` | `PASS`, `FAIL`, `ERROR` | Filter results by status |

Example: `GET /cis-results?status=FAIL`

### Response 200 OK

```json
{
  "results": [
    {
      "resource_id": "my-bucket#CIS-2.1.5",
      "timestamp": "2025-03-06T10:00:00+00:00",
      "check_id": "CIS-2.1.5",
      "check_name": "S3 Bucket Not Publicly Accessible",
      "resource": "my-bucket",
      "resource_type": "S3",
      "status": "PASS",
      "evidence": "All 4 public access blocks are enabled"
    },
    {
      "resource_id": "aws-root-account#CIS-1.5",
      "timestamp": "2025-03-06T10:00:00+00:00",
      "check_id": "CIS-1.5",
      "check_name": "Root Account MFA Enabled",
      "resource": "aws-root-account",
      "resource_type": "IAM",
      "status": "FAIL",
      "evidence": "CRITICAL: Root account MFA is NOT enabled. Enable immediately."
    }
  ],
  "summary": {
    "total": 8,
    "passed": 5,
    "failed": 3,
    "score_pct": 63
  }
}
```

### Result Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `resource_id` | string | DynamoDB primary key: `{resource}#{check_id}` |
| `timestamp` | string | Time when check was run (ISO 8601) |
| `check_id` | string | CIS benchmark check identifier |
| `check_name` | string | Human-readable check description |
| `resource` | string | The affected AWS resource |
| `resource_type` | string | `S3`, `IAM`, `CloudTrail`, `SecurityGroup` |
| `status` | string | `PASS`, `FAIL`, or `ERROR` |
| `evidence` | string | Explanation of why the check passed or failed |

---

## POST /scan

Triggers a fresh CIS security scan across all supported resources. Stores results in DynamoDB and returns them immediately.

### Request

```
POST https://{base-url}/prod/scan
Content-Type: application/json

{}
```

Empty body is acceptable. No parameters required.

### Response 200 OK

```json
{
  "results": [
    {
      "check_id": "CIS-2.1.5",
      "check_name": "S3 Bucket Not Publicly Accessible",
      "resource": "my-bucket",
      "resource_type": "S3",
      "status": "PASS",
      "evidence": "All 4 public access blocks are enabled",
      "timestamp": "2025-03-06T10:05:22+00:00"
    }
  ],
  "summary": {
    "total": 8,
    "passed": 6,
    "failed": 2,
    "errors": 0,
    "score_pct": 75
  },
  "timestamp": "2025-03-06T10:05:22+00:00"
}
```

### CIS Checks Executed

| Check ID | Check Name | Resource Type |
|----------|-----------|---------------|
| CIS-2.1.5 | S3 Bucket Not Publicly Accessible | S3 |
| CIS-2.1.1 | S3 Server-Side Encryption Enabled | S3 |
| CIS-1.5 | Root Account MFA Enabled | IAM |
| CIS-3.1 | CloudTrail Enabled and Logging | CloudTrail |
| CIS-5.2 | No Unrestricted SSH/RDP in Security Groups | SecurityGroup |

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Human-readable error message",
  "detail": "Technical detail or AWS error code"
}
```

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 500 | Internal server error (Lambda exception) |

---

## Testing with Postman

1. Create a new **Collection**: `Cloud Posture Scanner`
2. Set a **Collection Variable**: `base_url` = your API Gateway URL
3. Add requests:

```
GET  {{base_url}}/instances
GET  {{base_url}}/buckets
GET  {{base_url}}/cis-results
POST {{base_url}}/scan  (body: {})
```
