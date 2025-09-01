# API Documentation

## Overview

The Project Management System API is built with NestJS and provides RESTful endpoints for managing projects, tasks, users, and comments.

**Base URL**: `http://localhost:3001/api`

**Authentication**: JWT Bearer tokens

**API Documentation**: `http://localhost:3001/api/docs` (Swagger)

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@intersmart.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxyz123",
    "email": "admin@intersmart.com",
    "name": "Admin User",
    "role": "ADMIN",
    "avatar": null
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "DEVELOPER"
}
```

## Headers

Include the JWT token in all authenticated requests:

```http
Authorization: Bearer your-jwt-token-here
```

## Projects

### Get All Projects
```http
GET /api/projects
Authorization: Bearer {token}
```

### Create Project
```http
POST /api/projects
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "New Project",
  "office": "Dubai",
  "category": "REACT_NODEJS",
  "targetStage": "Development",
  "targetDate": "2024-12-31T00:00:00Z",
  "clientName": "Client Name",
  "observations": "Project notes..."
}
```

### Get Project by ID
```http
GET /api/projects/{id}
Authorization: Bearer {token}
```

### Update Project
```http
PATCH /api/projects/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "COMPLETED",
  "observations": "Updated notes..."
}
```

### Delete Project
```http
DELETE /api/projects/{id}
Authorization: Bearer {token}
```

### Add Custom Field
```http
POST /api/projects/{id}/custom-fields
Content-Type: application/json
Authorization: Bearer {token}

{
  "fieldName": "Budget",
  "fieldValue": "$50,000"
}
```

## Tasks

### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer {token}

# With filters
GET /api/tasks?projectId={id}&assigneeId={id}
```

### Create Task
```http
POST /api/tasks
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2024-12-31T00:00:00Z",
  "assigneeId": "user-id",
  "projectId": "project-id"
}
```

### Update Task
```http
PATCH /api/tasks/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}
```

## Users

### Get All Users
```http
GET /api/users
Authorization: Bearer {token}
```

### Get User by ID
```http
GET /api/users/{id}
Authorization: Bearer {token}
```

## Comments

### Get Comments
```http
GET /api/comments?projectId={id}
GET /api/comments?taskId={id}
Authorization: Bearer {token}
```

### Create Comment
```http
POST /api/comments
Content-Type: application/json
Authorization: Bearer {token}

{
  "content": "This is a comment",
  "projectId": "project-id"
  // OR
  // "taskId": "task-id"
}
```

## Enums

### Roles
- `ADMIN`
- `PROJECT_MANAGER`
- `DEVELOPER`
- `DESIGNER`
- `CLIENT`

### Project Categories
- `MOBILE_APP`
- `REACT_NODEJS`
- `ADVANCED_PHP`
- `CUSTOM_PHP`
- `CUSTOM_WP`
- `NEXT_JS`
- `ECOMMERCE`
- `NORMAL_WEB_APP`
- `BUSINESS_COLLATERAL`
- `WOOCOMMERCE`

### Project Status
- `ACTIVE`
- `HOLD`
- `COMPLETED`
- `CANCELLED`

### Task Status
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`

### Priority
- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Validation error messages"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

## Rate Limiting

The API implements rate limiting:
- Short: 10 requests per minute
- Medium: 20 requests per minute  
- Long: 100 requests per minute

## CORS

CORS is enabled for:
- Development: `http://localhost:3000`
- Production: Configurable via `FRONTEND_URL` environment variable