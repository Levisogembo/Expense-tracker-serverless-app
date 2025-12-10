import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export async function getAllExpenses(data, TableName) {
  if (!data?.user_id) {
    throw new Error('Missing required field: user_id');
  }
  try {
    const user_id = data.user_id
    if (!user_id) return { statusCode: 401, body: "Unauthorized" }

    const result = await ddb.send(
      new QueryCommand({
        TableName,
        KeyConditionExpression: "user_id = :uid",
        ExpressionAttributeValues: { ":uid": user_id }
      })
    )

    const expenses = result.Items
    const totalSpent = expenses.reduce((sum, item) => {
      console.log(item)
      return sum + (item.amount || 0)
    }, 0)

    return {
      success: true,
      count: expenses.length,
      totalSpent,
      expenses: result.Items
    }

  } catch (err) {
    console.error("Fetch Error:", err);
    return {
      success: false,
      body: "Server Error retrieving expenses"
    }
  }
}

export async function queryExpenses({ user_id }, queryParams, TableName) {
  if (!user_id) {
    throw new Error('Missing required field: userId');
  }
  const { month, year, category } = queryParams;

  const params = {
    TableName,
    KeyConditionExpression: "user_id = :uid",
    ExpressionAttributeValues: { ":uid": user_id },
    ExpressionAttributeNames: {}
  };

  // Convert types based on DynamoDB schema
  if (month) {
    params.IndexName = "monthLSI";
    params.KeyConditionExpression = "user_id = :uid AND #month = :month";
    params.ExpressionAttributeNames["#month"] = "month";
    params.ExpressionAttributeValues[":month"] = month; // String

    let filters = [];

    if (year) {
      filters.push("#year = :year");
      params.ExpressionAttributeNames["#year"] = "year";
      // Convert year to NUMBER
      params.ExpressionAttributeValues[":year"] = parseInt(year, 10);
    }

    if (category) {
      filters.push("#category = :category");
      params.ExpressionAttributeNames["#category"] = "category";
      params.ExpressionAttributeValues[":category"] = category; // String
    }

    if (filters.length > 0) {
      params.FilterExpression = filters.join(" AND ");
    }

  } else if (year) {
    console.log('inside the year block');
    params.IndexName = "yearLSI";
    params.KeyConditionExpression = "user_id = :uid AND #year = :year";
    params.ExpressionAttributeNames["#year"] = "year";
    // Convert year to NUMBER
    params.ExpressionAttributeValues[":year"] = parseInt(year, 10);

    // Additional filter (category only, month not provided)
    if (category) {
      params.FilterExpression = "#category = :category";
      params.ExpressionAttributeNames["#category"] = "category";
      params.ExpressionAttributeValues[":category"] = category;
    }

  } else if (category) {
    params.IndexName = "categoryLSI";
    params.KeyConditionExpression = "user_id = :uid AND #category = :category";
    params.ExpressionAttributeNames["#category"] = "category";
    params.ExpressionAttributeValues[":category"] = category;

    // Additional filter (year only, month not provided)
    if (year) {
      params.FilterExpression = "#year = :year";
      params.ExpressionAttributeNames["#year"] = "year";
      // Convert year to NUMBER
      params.ExpressionAttributeValues[":year"] = parseInt(year, 10);
    }
  }

  try {
    console.log("DynamoDB Query Params:", JSON.stringify(params, null, 2));
    const result = await ddb.send(new QueryCommand(params));
    return {
      success: true,
      totalSpent: result.Items.reduce((sum, x) => sum + (x.amount || 0), 0),
      items: result.Items.length === 0 ? `No results found try again` : result.Items
    };
  } catch (error) {
    console.error("Query error:", error);
    console.error("Failed params:", JSON.stringify(params, null, 2));
    throw error;
  }
}

