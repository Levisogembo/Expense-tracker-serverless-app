import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import crypto from "crypto";

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)//enables automatic conversion to dynamo db types

export async function createExpense (data, tableName) {
    try {
        // Validate required fields
        if (!data?.user_id) {
            throw new Error('Missing required field: userId');
        }

        // Build the DynamoDB item
        const item = {
            'user_id': data.user_id, //partition key       
            'month': new Date().toLocaleString('default', { month: 'long' }),
            'year': new Date().getFullYear(),
            'email': data.email,
            'category': data.category,
            'amount': data.amount,
            'notes': data.notes,
            'expense_id': crypto.randomUUID(),//sort key
            'created_at': new Date().toISOString(),
            'updated_at': new Date().toISOString(),
            'payment_method': data.payment_method
        };

        console.log('Preparing DynamoDB item:', JSON.stringify(item, null, 2));

        // Create and execute PutCommand
        const command = new PutCommand({
            TableName: tableName,
            Item: item,
        })

        const result = await docClient.send(command);
        
        console.log(`Successfully saved ${item.key} to DynamoDB table ${tableName}`);
        
        return {
            success: true,
            item: item,
        };

    } catch (error) {
        console.error('Error saving to DynamoDB:', error);
        
        // Special handling for conditional check failures
        if (error.name === 'ConditionalCheckFailedException') {
            return {
                success: false,
                error: 'Item already exists in DynamoDB',
                errorType: 'DuplicateItem',
                item: null
            };
        }
        
        return {
            success: false,
            error: error.message,
            errorType: error.name || 'UnknownError',
            item: null
        };
    }
}
