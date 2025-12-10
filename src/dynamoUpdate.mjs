import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client)

export async function updateExpense(expense_id, {user_id}, updateData, TableName) {
    // Remove expense_id and user_id from updateData if present
    let { expense_id: _, user_id: __, amount, ...updateFields } = updateData;
    if (amount !== undefined && amount !== null) {
        updateFields.amount = parseInt(amount, 10);
    }

    if (Object.keys(updateFields).length === 0) {
        throw new Error("No fields to update");
    }

    // Build update expression
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    let expressionCounter = 0;//to maintain unique expression attribute names and values

    Object.entries(updateFields).forEach(([key, value]) => {
        // Skip null/undefined values
        if (value === null || value === undefined) {
            return;
        }

        const attributeName = `#attr${expressionCounter}`;
        const attributeValue = `:val${expressionCounter}`;

        updateExpressions.push(`${attributeName} = ${attributeValue}`);
        expressionAttributeNames[attributeName] = key;
        expressionAttributeValues[attributeValue] = value;

        expressionCounter++;
    });

    // Add updated_at field automatically
    const updatedAtAttributeName = `#attr${expressionCounter}`;
    const updatedAtAttributeValue = `:val${expressionCounter}`;

    updateExpressions.push(`${updatedAtAttributeName} = ${updatedAtAttributeValue}`);
    expressionAttributeNames[updatedAtAttributeName] = 'updated_at';
    expressionAttributeValues[updatedAtAttributeValue] = new Date().toISOString();

    if (updateExpressions.length === 0) {
        throw new Error("No valid fields to update");
    }

    const params = {
        TableName,
        Key: { user_id, expense_id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
        ConditionExpression: "user_id = :user_id",
        ExpressionAttributeValues: {
            ...expressionAttributeValues,
            ":user_id": user_id
        }
    }

    try {
        const result = await ddb.send(new UpdateCommand(params));
        return {
            success: true,
            updatedItem: result.Attributes
        };
    } catch (error) {
        console.error("Update error:", error);

        if (error.name === 'ConditionalCheckFailedException') {
            throw new Error("Expense not found or you don't have permission to update it");
        }

        throw error;
    }
}