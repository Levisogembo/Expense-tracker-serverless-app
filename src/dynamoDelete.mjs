import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export async function deleteExpense({user_id}, expense_id, TableName) {
    // Validate inputs
    if (!user_id || !expense_id) {
      throw new Error("User ID and Expense ID are required");
    }
  
    const params = {
      TableName,
      Key: {
        user_id,      // Partition Key (PK)
        expense_id    // Sort Key (SK)
      },
      ReturnValues: "ALL_OLD" // Returns the deleted item
    };
  
    try {
      console.log("Deleting expense:", { user_id, expense_id });
      console.log("Table name:", TableName);
      
      const result = await ddb.send(new DeleteCommand(params));
      
      // If no attributes returned, item didn't exist
      if (!result.Attributes) {
        throw new Error(`Expense with ID ${expense_id} not found`);
      }
      
      console.log("Delete successful, deleted item:", result.Attributes);
      
      return {
        success: true,
        message: "Expense deleted successfully",
        deletedItem: result.Attributes
      };
      
    } catch (error) {
      console.error("Delete error details:", {
        name: error.name,
        message: error.message,
        user_id,
        expense_id,
        table: TableName
      });
      
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error(`Expense not found for user ${user_id}`);
      }
      
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Table ${TableName} not found. Check table name.`);
      }
      
      if (error.name === 'ValidationException') {
        throw new Error(`Invalid key format: ${expense_id}`);
      }
      
      throw error;
    }
  }