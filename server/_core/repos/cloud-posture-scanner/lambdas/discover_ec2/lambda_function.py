"""
Lambda Function: discover_ec2_lambda
Description: Discovers all EC2 instances in the configured region and returns
             their key attributes including security group associations.
IAM Permissions Required: ec2:DescribeInstances, ec2:DescribeSecurityGroups
"""

import boto3
import json
import os
from datetime import datetime

REGION = os.environ.get('AWS_REGION_TARGET', 'us-east-1')


def lambda_handler(event, context):
    ec2 = boto3.client('ec2', region_name=REGION)

    try:
        response = ec2.describe_instances()
        instances = []

        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                security_groups = [
                    {'id': sg['GroupId'], 'name': sg['GroupName']}
                    for sg in instance.get('SecurityGroups', [])
                ]

                # Extract Name tag if present
                name_tag = next(
                    (tag['Value'] for tag in instance.get('Tags', []) if tag['Key'] == 'Name'),
                    'Unnamed'
                )

                instances.append({
                    'instance_id': instance['InstanceId'],
                    'instance_name': name_tag,
                    'instance_type': instance['InstanceType'],
                    'region': REGION,
                    'public_ip': instance.get('PublicIpAddress', None),
                    'private_ip': instance.get('PrivateIpAddress', None),
                    'state': instance['State']['Name'],
                    'security_groups': security_groups,
                    'launch_time': instance['LaunchTime'].isoformat(),
                    'ami_id': instance.get('ImageId', 'N/A'),
                    'vpc_id': instance.get('VpcId', 'N/A'),
                })

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'instances': instances,
                'count': len(instances),
                'region': REGION,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            })
        }

    except Exception as e:
        print(f"[ERROR] discover_ec2_lambda failed: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': 'Failed to discover EC2 instances',
                'detail': str(e)
            })
        }
