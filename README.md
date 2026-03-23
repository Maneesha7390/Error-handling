# @ahextechnology/sucess-error-responses

Utility package for consistent API responses in Node.js/Express applications.

It supports:
- Legacy response format (`sendResponse`, `handleError`, `Status`, `Pagination`)
- Standardized success/error envelopes (`successResponse`, `errorResponse`)
- Custom application errors (`AppError`, `createErrorCatalog`, `errorResponseFromError`)

## Installation

```bash
npm install @ahextechnology/sucess-error-responses
```

## Exports

```js
const {
  // Legacy API
  NoResponseError,
  ServerError,
  ClientError,
  Status,
  Pagination,
  handleError,
  sendResponse,

  // Standardized API
  successResponse,
  errorResponse,
  errorResponseFromError,
  SuccessResponse,
  ErrorResponse,
  Meta,
  ErrorDetail,

  // Custom error utilities
  AppError,
  createErrorCatalog,
} = require('@ahextechnology/sucess-error-responses');
```

## Standardized Response Format

### Success response shape

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "id": 1, "name": "John" },
  "meta": null,
  "timestamp": "2026-03-23T06:58:26.641Z"
}
```

### Error response shape

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "statusCode": 422,
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  },
  "timestamp": "2026-03-23T06:58:26.641Z"
}
```

## Usage

### 1) successResponse

```js
const express = require('express');
const { successResponse } = require('@ahextechnology/sucess-error-responses');

const app = express();

app.get('/user/:id', (req, res) => {
  const user = { id: Number(req.params.id), name: 'John' };
  return successResponse(res, 'User fetched successfully', user);
});
```

With pagination metadata:

```js
const { successResponse } = require('@ahextechnology/sucess-error-responses');

app.get('/users', (req, res) => {
  const users = [{ id: 1 }, { id: 2 }];
  return successResponse(
    res,
    'Users listed',
    users,
    { page: 1, limit: 10, total: 25 } // meta
  );
});
```

### 2) errorResponse

```js
const { errorResponse, ErrorDetail } = require('@ahextechnology/sucess-error-responses');

app.get('/not-found', (req, res) => {
  return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
});

app.get('/validation', (req, res) => {
  const details = [
    new ErrorDetail('email', 'Email is required'),
    new ErrorDetail('password', 'Password must be at least 8 characters'),
  ];
  return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 422, details);
});
```

Masked error example (hide real HTTP status from clients):

```js
return errorResponse(
  res,
  'Database connection failed',
  'DB_CONNECTION_FAILED',
  503,   // real status
  null,
  true,  // maskError
  1001   // body.error.statusCode
);
```

### 3) AppError + createErrorCatalog + errorResponseFromError

```js
const {
  createErrorCatalog,
  errorResponseFromError,
} = require('@ahextechnology/sucess-error-responses');

const DB_ERRORS = createErrorCatalog({
  CONNECTION_FAILED: {
    message: 'Database connection failed',
    code: 'DB_CONNECTION_FAILED',
    statusCode: 503,
    errorNumber: 1001,
  },
  RECORD_NOT_FOUND: {
    message: 'Record not found',
    code: 'NOT_FOUND',
    statusCode: 404,
  },
});

app.get('/catalog-error', (req, res) => {
  return errorResponseFromError(res, DB_ERRORS.CONNECTION_FAILED, true);
});
```

## Legacy API (Backward Compatibility)

The original API is still available:
- `sendResponse(req, res, next, items, statusModel, pagination)`
- `handleError(err, req, res, next)`
- `Status`, `Pagination`
- `NoResponseError`, `ServerError`, `ClientError`

Example:

```js
const {
  sendResponse,
  Status,
  Pagination,
} = require('@ahextechnology/sucess-error-responses');

app.get('/legacy/items', (req, res, next) => {
  const items = [{ id: 1 }, { id: 2 }];
  const status = new Status(200, 'Success', 'Items fetched successfully');
  const pagination = new Pagination('id', 'asc', 2, 10, 1, false);
  return sendResponse(req, res, next, items, status, pagination);
});
```

## Local Verification

```bash
npm test
```

## Publish Checklist (npm)

1. Update `version` in `package.json` (semver).
2. Confirm package name is correct: `@ahextechnology/sucess-error-responses`.
3. Run:
   ```bash
   npm install
   npm test
   ```
4. Login and publish:
   ```bash
   npm login
   npm publish --access public
   ```

## License

ISC
