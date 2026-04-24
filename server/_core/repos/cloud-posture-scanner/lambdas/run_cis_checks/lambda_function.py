"""
Lambda Function: run_cis_checks_lambda
Description: Executes 5 CIS AWS Benchmark security checks across EC2, S3,
             IAM, and CloudTrail. Stores results in DynamoDB.
Timeout:     Set to 30 seconds in Lambda configuration.
IAM Permissions Required: ec2:DescribeSecurityGroups, s3:ListAllMyBuckets,
  s3:GetBucketEncryption, s3:GetBucketPublicAccessBlock, iam:GetAccountSummary,
  cloudtrail:DescribeTrails, cloudtrail:GetTrailStatus, dynamodb:PutItem
"""

import boto3
import json
import os
from datetime import datetime, timezone
from botocore.exceptions import ClientError

REGION = os.environ.get('AWS_REGION_TARGET', 'us-east-1')
TABLE_NAME = os.environ.get('DYNAMODB_TABLE', 'scan_results')


def make_result(check_id, check_name, resource, resource_type, status, evidence):
    return {
        'check_id': check_id,
        'check_name': check_name,
        'resource': resource,
        'resource_type': resource_type,
        'status': status,       # PASS | FAIL | ERROR
        'evidence': evidence,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }


def check_s3_public_access(s3):
    """CIS 2.1.5 - Ensure S3 buckets are not publicly accessible"""
    results = []
    try:
        buckets = s3.list_buckets().get('Buckets', [])
        for bucket in buckets:
            name = bucket['Name']
            try:
                pab = s3.get_public_access_block(Bucket=name)
                cfg = pab['PublicAccessBlockConfiguration']
                blocked = all([
                    cfg.get('BlockPublicAcls', False),
                    cfg.get('BlockPublicPolicy', False),
                    cfg.get('IgnorePublicAcls', False),
                    cfg.get('RestrictPublicBuckets', False)
                ])
                status = 'PASS' if blocked else 'FAIL'
                evidence = 'All 4 public access blocks are enabled' if blocked \
                    else f"Public access not fully blocked. Config: {cfg}"
            except ClientError as e:
                status = 'FAIL'
                evidence = f"No public access block config found: {e.response['Error']['Code']}"

            results.append(make_result(
                'CIS-2.1.5', 'S3 Bucket Not Publicly Accessible',
                name, 'S3', status, evidence
            ))
    except Exception as e:
        results.append(make_result(
            'CIS-2.1.5', 'S3 Bucket Not Publicly Accessible',
            'ALL_BUCKETS', 'S3', 'ERROR', str(e)
        ))
    return results


def check_s3_encryption(s3):
    """CIS 2.1.1 - Ensure all S3 buckets have server-side encryption"""
    results = []
    try:
        buckets = s3.list_buckets().get('Buckets', [])
        for bucket in buckets:
            name = bucket['Name']
            try:
                enc = s3.get_bucket_encryption(Bucket=name)
                algo = enc['ServerSideEncryptionConfiguration']['Rules'][0]\
                    ['ApplyServerSideEncryptionByDefault']['SSEAlgorithm']
                status = 'PASS'
                evidence = f'Encryption enabled with algorithm: {algo}'
            except ClientError as e:
                code = e.response['Error']['Code']
                if code == 'ServerSideEncryptionConfigurationNotFoundError':
                    status = 'FAIL'
                    evidence = 'No server-side encryption configured on this bucket'
                else:
                    status = 'ERROR'
                    evidence = f'API error: {code}'

            results.append(make_result(
                'CIS-2.1.1', 'S3 Server-Side Encryption Enabled',
                name, 'S3', status, evidence
            ))
    except Exception as e:
        results.append(make_result(
            'CIS-2.1.1', 'S3 Server-Side Encryption Enabled',
            'ALL_BUCKETS', 'S3', 'ERROR', str(e)
        ))
    return results


def check_iam_root_mfa(iam):
    """CIS 1.5 - Ensure MFA is enabled for the root account"""
    try:
        summary = iam.get_account_summary()['SummaryMap']
        mfa_enabled = summary.get('AccountMFAEnabled', 0)
        status = 'PASS' if mfa_enabled else 'FAIL'
        evidence = 'Root account MFA is ENABLED' if mfa_enabled \
            else 'CRITICAL: Root account MFA is NOT enabled. Enable immediately.'
        return [make_result(
            'CIS-1.5', 'Root Account MFA Enabled',
            'aws-root-account', 'IAM', status, evidence
        )]
    except Exception as e:
        return [make_result(
            'CIS-1.5', 'Root Account MFA Enabled',
            'aws-root-account', 'IAM', 'ERROR', str(e)
        )]


def check_cloudtrail_enabled(ct):
    """CIS 3.1 - Ensure CloudTrail is enabled in all regions"""
    try:
        trails = ct.describe_trails(includeShadowTrails=True).get('trailList', [])
        if not trails:
            return [make_result(
                'CIS-3.1', 'CloudTrail Enabled',
                'ALL_REGIONS', 'CloudTrail', 'FAIL',
                'No CloudTrail trails found in this account'
            )]

        results = []
        for trail in trails:
            trail_name = trail['Name']
            trail_arn = trail['TrailARN']
            try:
                status_resp = ct.get_trail_status(Name=trail_arn)
                is_logging = status_resp.get('IsLogging', False)
                status = 'PASS' if is_logging else 'FAIL'
                evidence = f'Trail is actively logging' if is_logging \
                    else f'Trail exists but logging is DISABLED'
            except Exception as e:
                status = 'ERROR'
                evidence = str(e)

            results.append(make_result(
                'CIS-3.1', 'CloudTrail Enabled and Logging',
                trail_name, 'CloudTrail', status, evidence
            ))
        return results
    except Exception as e:
        return [make_result(
            'CIS-3.1', 'CloudTrail Enabled',
            'ALL_REGIONS', 'CloudTrail', 'ERROR', str(e)
        )]


def check_sg_no_open_ssh_rdp(ec2):
    """CIS 5.2 - Ensure no security groups allow unrestricted SSH/RDP"""
    try:
        sgs = ec2.describe_security_groups().get('SecurityGroups', [])
        results = []

        for sg in sgs:
            sg_id = sg['GroupId']
            sg_name = sg['GroupName']
            open_ports = []

            for rule in sg.get('IpPermissions', []):
                from_port = rule.get('FromPort', -1)
                to_port = rule.get('ToPort', -1)

                # Check both IPv4 and IPv6 open ranges
                open_ipv4 = any(r.get('CidrIp') == '0.0.0.0/0' for r in rule.get('IpRanges', []))
                open_ipv6 = any(r.get('CidrIpv6') == '::/0' for r in rule.get('Ipv6Ranges', []))

                if open_ipv4 or open_ipv6:
                    if from_port == -1 or (from_port <= 22 <= to_port):
                        open_ports.append('SSH(22)')
                    if from_port == -1 or (from_port <= 3389 <= to_port):
                        open_ports.append('RDP(3389)')

            status = 'FAIL' if open_ports else 'PASS'
            evidence = f'Unrestricted access to: {list(set(open_ports))}' if open_ports \
                else 'No unrestricted SSH or RDP access found'

            results.append(make_result(
                'CIS-5.2', 'No Unrestricted SSH/RDP in Security Groups',
                f'{sg_id} ({sg_name})', 'SecurityGroup', status, evidence
            ))
        return results
    except Exception as e:
        return [make_result(
            'CIS-5.2', 'No Unrestricted SSH/RDP in Security Groups',
            'ALL_SECURITY_GROUPS', 'SecurityGroup', 'ERROR', str(e)
        )]


def store_results(results):
    """Write all check results to DynamoDB"""
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(TABLE_NAME)

        with table.batch_writer() as batch:
            for r in results:
                pk = f"{r['resource']}#{r['check_id']}"
                batch.put_item(Item={
                    'resource_id': pk,
                    'timestamp': r['timestamp'],
                    'check_id': r['check_id'],
                    'check_name': r['check_name'],
                    'resource': r['resource'],
                    'resource_type': r['resource_type'],
                    'status': r['status'],
                    'evidence': r['evidence']
                })
        print(f"[INFO] Stored {len(results)} results to DynamoDB table: {TABLE_NAME}")
    except Exception as e:
        print(f"[ERROR] DynamoDB write failed: {str(e)}")


def lambda_handler(event, context):
    s3 = boto3.client('s3')
    iam = boto3.client('iam')
    ec2 = boto3.client('ec2', region_name=REGION)
    ct = boto3.client('cloudtrail', region_name=REGION)

    all_results = []
    all_results.extend(check_s3_public_access(s3))
    all_results.extend(check_s3_encryption(s3))
    all_results.extend(check_iam_root_mfa(iam))
    all_results.extend(check_cloudtrail_enabled(ct))
    all_results.extend(check_sg_no_open_ssh_rdp(ec2))

    store_results(all_results)

    passed = [r for r in all_results if r['status'] == 'PASS']
    failed = [r for r in all_results if r['status'] == 'FAIL']
    errors = [r for r in all_results if r['status'] == 'ERROR']

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'results': all_results,
            'summary': {
                'total': len(all_results),
                'passed': len(passed),
                'failed': len(failed),
                'errors': len(errors),
                'score_pct': round((len(passed) / len(all_results)) * 100) if all_results else 0
            },
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
    }
