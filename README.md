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

## API Endpoints
### Expenses Management
1. **POST /expenses** - Create a new expense
2. **GET /expenses** - List all expenses (with optional filters)
3. **GET /expenses/{expense_id}** - Get specific expense
4. **PATCH /expenses/{expense_id}** - Update an expense
5. **DELETE /expenses/{expense_id}** - Delete an expense

### Expense Queries
1. **GET /expenses?month=June&year=2025** - Filter by month/year
2. **GET /expenses?category=Food** - Filter by category
3. **GET /expenses?month=June&category=Rent&year=2025** - Combined filters

## Deployment Steps
1. **Create DynamoDB table with user_id as PK and expense_id as SK**
2. **Set up Cognito User Pool and App Client**
3. **Configure API Gateway with Cognito authorizer and setup resources**
4. **Deploy Lambda functions with necessary IAM roles**
5. **Configure environment variables in Lambda**
6. **Deploy API Gateway to stages**
