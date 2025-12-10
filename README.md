# Expense-tracker-serverless-app
A fully serverless expense tracking backend application built with AWS serverless technologies. This is a serveless application backend using AWS API Gateway, AWS Lambda, AWS Dynamodb providing a scalable infrastructure. The application allows users to track their expenses with categories, amounts, payment methods, and notes.

## Technologies Used
1. **API Gateway**: REST API endpoints with CORS support
2. **AWS Lambda**: Serverless compute for business logic
3. **Amazon DynamoDB**: NoSQL database for expense storage
4. **Amazon Cognito**: User authentication and authorization
5. **IAM**: Security and access management
6. **CloudWatch**: Logging and monitoring

## Database Schema
### Expenses Table
Partition Key: user_id (String) - Cognito user ID
Sort Key: expense_id (String) - UUID

Attributes:
category (String) - Expense category (Rent, Food, Transport, etc.)
amount (Number) - Expense amount
notes (String) - Additional notes
payment_method (String) - Cash, Credit Card, Mpesa, etc.
month (String) - Month of expense
year (Number) - Year of expense
created_at (String) - ISO timestamp of creation
updated_at (String) - ISO timestamp of last update

## Authentication
1. **User registration and login via Amazon Cognito**
2. **JWT tokens for API authorization**
3. **Each user can only access their own expenses**
4. **Secure password policies and email verification**
