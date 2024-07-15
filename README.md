# Error Handling and Response Module

This module provides a set of classes and functions for handling errors and sending responses in a Node.js application. It includes custom error classes, a status class, pagination support, and utility functions for error handling and sending structured responses.

## Installation

To install the module, run:

```bash
npm install ahex-error-response-utils
```

## Usage

### Importing the Module

```javascript
const {
  NoResponseError,
  ServerError,
  ClientError,
  Status,
  Pagination,
  handleError,
  sendResponse
} = require('your-package-name');
const logger = require('./shared/utils/logger');
const ERROR_MESSAGES = require('./shared/enums/error-messages');
const AUDIT_STATUS = require('./shared/enums/audit-logs-enums').Status;
```

### Example Usage

#### Error Handling

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/example', async (req, res, next) => {
    try {
        // Simulate an error
        throw new ServerError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR_500, ERROR_MESSAGES.CONTACT_ADMINISTRATOR);
    } catch (err) {
        // Handle the error
        handleError(err, req, res, next);
    }
});

// Middleware for handling errors
app.use((err, req, res, next) => {
    handleError(err, req, res, next);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
```

#### Sending Responses

```javascript
app.get('/data', (req, res, next) => {
    const data = { key: 'value' };
    const status = new Status(200, 'Success', 'Data fetched successfully');
    sendResponse(req, res, next, data, status);
});
```

#### Pagination

```javascript
app.get('/items', (req, res, next) => {
    const items = [{ id: 1 }, { id: 2 }];
    const status = new Status(200, 'Success', 'Items fetched successfully');
    const pagination = new Pagination('id', 'asc', 2, 10, 1, false);
    sendResponse(req, res, next, items, status, pagination);
});
```

## Classes

### NoResponseError

This class represents an error that occurs when there is no response.

```javascript
class NoResponseError extends Error {
    constructor(status = 500, message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR_500, description = ERROR_MESSAGES.CONTACT_ADMINISTRATOR) {
        super(message);
        this.message = message;
        this.status = status;
        this.description = description;
    }
}
```

### ServerError

This class represents a server-side error.

```javascript
class ServerError extends Error {
    constructor(status = 500, message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR_500, description = ERROR_MESSAGES.CONTACT_ADMINISTRATOR) {
        super(message);
        this.message = message;
        this.status = status;
        this.description = description;
    }
}
```

### ClientError

This class represents a client-side error.

```javascript
class ClientError extends Error {
    constructor(status, message, description = '') {
        super(message);
        this.message = message;
        this.status = status;
        this.description = description;
    }
}
```

## Status Class

The `Status` class represents the status of a response.

```javascript
class Status {
    constructor(code = 200, message = '', description = '') {
        this.code = code;
        this.message = message;
        this.description = description;
    }
}
```

## Pagination Class

The `Pagination` class provides pagination support for responses.

```javascript
class Pagination {
    constructor(sortColumn, sortDirection = 'asc', total = 1, pageSize = 10, pageIndex = 1, hasMore) {
        this.sortColumn = sortColumn;
        this.sortDirection = sortDirection;
        this.total = total;
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        if (hasMore != null) {
            this.hasMore = hasMore;
        }
    }
}
```

## Functions

### handleError

The `handleError` function logs the error and sends a response with the appropriate status and message.

### sendResponse

The `sendResponse` function sends a structured response.

## License

This project is licensed under the MIT License
