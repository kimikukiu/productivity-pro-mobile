"""
Lambda Function: get_results_lambda
Description: Reads all stored CIS benchmark scan results from DynamoDB
             and returns them as a structured JSON response.
IAM Permissions Required: dynamodb:Scan
"""

import boto3
import json
import os
from boto3.dynamodb.conditions import Attr

TABLE_NAME = os.environ.get('DYNAMODB_TABLE', 'scan_results')


def lambda_handler(event, context):
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(TABLE_NAME)

        # Optional filter by status via query param: ?status=FAIL
        params = event.get('queryStringParameters') or {}
        filter_status = params.get('status', '').upper()

        if filter_status in ('PASS', 'FAIL', 'ERROR'):
            response = table.scan(FilterExpression=Attr('status').eq(filter_status))
        else:
            response = table.scan()

        items = response.get('Items', [])

        # Handle DynamoDB pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))

        # Sort by timestamp descending
        items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)

        passed = sum(1 for i in items if i.get('status') == 'PASS')
        failed = sum(1 for i in items if i.get('status') == 'FAIL')

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'results': items,
                'summary': {
                    'total': len(items),
                    'passed': passed,
                    'failed': failed,
                    'score_pct': round((passed / len(items)) * 100) if items else 0
                }
            })
        }

    except Exception as e:
        print(f"[ERROR] get_results_lambda failed: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': 'Failed to retrieve scan results',
                'detail': str(e)
            })
        }
