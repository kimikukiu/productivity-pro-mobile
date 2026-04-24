"""
Lambda Function: discover_s3_lambda
Description: Discovers all S3 buckets in the account and checks their
             encryption status and public access configuration.
IAM Permissions Required: s3:ListAllMyBuckets, s3:GetBucketEncryption,
                          s3:GetBucketPublicAccessBlock, s3:GetBucketLocation
"""

import boto3
import json
import os
from datetime import datetime
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    buckets_info = []

    try:
        response = s3.list_buckets()
        buckets = response.get('Buckets', [])

        for bucket in buckets:
            bucket_name = bucket['Name']
            created = bucket['CreationDate'].isoformat()

            # --- Region ---
            try:
                location = s3.get_bucket_location(Bucket=bucket_name)
                region = location['LocationConstraint'] or 'us-east-1'
            except ClientError:
                region = 'unknown'

            # --- Encryption ---
            try:
                enc = s3.get_bucket_encryption(Bucket=bucket_name)
                rules = enc['ServerSideEncryptionConfiguration']['Rules']
                algo = rules[0]['ApplyServerSideEncryptionByDefault']['SSEAlgorithm']
                encryption_status = 'ENABLED'
                encryption_type = algo  # e.g. AES256, aws:kms
            except ClientError as e:
                if e.response['Error']['Code'] == 'ServerSideEncryptionConfigurationNotFoundError':
                    encryption_status = 'DISABLED'
                    encryption_type = 'NONE'
                else:
                    encryption_status = 'UNKNOWN'
                    encryption_type = 'UNKNOWN'

            # --- Public Access Block ---
            try:
                public_access = s3.get_public_access_block(Bucket=bucket_name)
                config = public_access['PublicAccessBlockConfiguration']
                all_blocked = all([
                    config.get('BlockPublicAcls', False),
                    config.get('BlockPublicPolicy', False),
                    config.get('IgnorePublicAcls', False),
                    config.get('RestrictPublicBuckets', False)
                ])
                access_policy = 'PRIVATE' if all_blocked else 'PUBLIC'
                public_access_config = config
            except ClientError:
                access_policy = 'UNKNOWN'
                public_access_config = {}

            buckets_info.append({
                'bucket_name': bucket_name,
                'region': region,
                'created': created,
                'encryption_status': encryption_status,
                'encryption_type': encryption_type,
                'access_policy': access_policy,
                'public_access_config': public_access_config
            })

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'buckets': buckets_info,
                'count': len(buckets_info),
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            })
        }

    except Exception as e:
        print(f"[ERROR] discover_s3_lambda failed: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': 'Failed to discover S3 buckets',
                'detail': str(e)
            })
        }
