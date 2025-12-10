import { decryptEnvVar } from './kmsDecrypt.mjs'
import { createExpense } from './dynamoCreate.mjs'
import { getAllExpenses, queryExpenses } from './dynamoFetch.mjs'
import { updateExpense } from './dynamoUpdate.mjs'
import { deleteExpense } from './dynamoDelete.mjs'

await decryptEnvVar("TABLE_NAME");
const TABLE_NAME = process.env.TABLE_NAME

export const handler = async (event) => {
  const userId = event.requestContext?.authorizer?.claims?.sub
  console.log("Authorizer:", userId)
  const email = event.requestContext?.authorizer?.claims?.email
  const queryParams = event.queryStringParameters || {}
  const isEmptyParams = Object.entries(queryParams).length === 0 //check if any filters have been provided
  const method = event.httpMethod
  const path = event.path
  let results = null
  let data = JSON.parse(event.body)
  data.user_id = userId
  if (method === 'POST') {
    data.email = email
    results = await createExpense(data, TABLE_NAME)
  } else if (method === 'GET' && !isEmptyParams) {
    results = await queryExpenses(data, queryParams, TABLE_NAME)
  } else if (method === 'GET') {
    results = await getAllExpenses(data, TABLE_NAME)
  } else if (method === 'PATCH' && !isEmptyParams) {
    const expense_id = queryParams.expense_id
    results = await updateExpense(expense_id, data, data, TABLE_NAME)
  } else if (method === 'DELETE' && !isEmptyParams) {
    const expense_id = queryParams.expense_id
    results = await deleteExpense(data, expense_id, TABLE_NAME)
  }
  console.log(`event:${JSON.stringify(event, null, 4)},method:${method},path:${path},table:${TABLE_NAME}`)
  if (results) {
    return {
      statusCode: results.success == true ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'output',
        results
      }, null, 4)
    };
  } else {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Error processing request from api gateway',
      }, null, 2)
    };
  }

};