# API Documentation

This section provides an overview of the API documentation for the project.

---

[[toc]]

## Endpoints

We use swagger to document the API endpoints. You can access the API documentation by visiting the `/api-docs` route in your browser.

For example, if your application is running on `http://localhost:3000`, you can access the API documentation at <http://localhost:3000/api-docs>.

## Authentication

We use JWT for authentication. You need to include the `Authorization` header with the value `Bearer <token>` in your requests.

Where `<token>` is the JWT token you received after logging in.

## **Error Handling** ⚠️

Nova Learn uses **standard HTTP status codes** to indicate the success or failure of API requests.

| **Status Code** | **Meaning**           | **When Used**                           |
| --------------- | --------------------- | --------------------------------------- |
| `200`           | OK                    | Successful request                      |
| `201`           | Created               | Resource successfully created           |
| `400`           | Bad Request           | Validation error or malformed request   |
| `401`           | Unauthorized          | Missing or invalid authentication token |
| `403`           | Forbidden             | Access denied                           |
| `404`           | Not Found             | Resource not found                      |
| `422`           | Unprocessable Entity  | Valid request but unable to process     |
| `500`           | Internal Server Error | Unhandled exceptions                    |

---

### **Error Response Format**

In case of an error, the API returns a **structured JSON object**:

```json
{
  "timestamp": "2025-09-04T10:12:45.123Z",
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed for request body",
  "errorCode": "VALIDATION_FAILED",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

---

### Error DTO Structure

The error response includes the following fields:

| Field      | Type             | Description                                     | Required    |
| ---------- | ---------------- | ----------------------------------------------- | ----------- |
| timestamp  | string           | ISO timestamp when the error occurred           | ✅ Required |
| statusCode | number           | HTTP status code                                | ✅ Required |
| error      | string           | Short error title                               | ✅ Required |
| message    | string           | Human-readable description of the error         | ✅ Required |
| errorCode  | string           | Application-specific error code                 | ❌ Optional |
| details    | ErrorDetailDto[] | Detailed field-level validation errors          | ❌ Optional |
| stack      | string           | Stack trace (development mode only)             | ❌ Optional |
| trace      | Error            | Internal debugging info (development mode only) | ❌ Optional |

Example Error DTO:

---

### Development vs Production Mode

<ul>
  <li>
    <p>
      <strong>Development</strong> (NODE_ENV=development) → Includes stack and trace in the response for debugging.
    </p>
  </li>
  <li>
    <p>
      <strong>Production</strong> (NODE_ENV=production) → Hides sensitive fields (stack, trace) for security.
    </p>
  </li>
</ul>

---

### Best Practices

Always check the statusCode before handling errors.

Use errorCode for application-specific error handling.

Handle errors gracefully and provide meaningful feedback to users.
