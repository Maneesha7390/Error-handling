const logger = require('./shared/utils/logger');
const ERROR_MESSAGES = require('./shared/enums/error-messages');
const AUDIT_STATUS = require('./shared/enums/audit-logs-enums').Status;
const SuccessResponse = require('./shared/models/success-response.model');
const ErrorResponse = require('./shared/models/error-response.model');
const Meta = require('./shared/models/meta.model');
const ErrorDetail = require('./shared/models/error-detail.model');
const AppError = require('./shared/models/app-error.model');
const { createErrorCatalog } = require('./shared/utils/error-catalog');
const STATUS_TYPE = require('./shared/enums/response-status');

class NoResponseError extends Error {
  /**
   * @param {number} [status=500]
   * @param {string} [message=ERROR_MESSAGES.INTERNAL_SERVER_ERROR_500]
   * @param {string} [description=ERROR_MESSAGES.CONTACT_ADMINISTRATOR]
   */
    constructor(status = 500, message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR_500, description = ERROR_MESSAGES.CONTACT_ADMINISTRATOR) {
        super(message);
        this.message = message;
        this.status = status;
        this.description = description;
    }
}

class ServerError extends Error {
    /**
     * 
     * @param {*} status 
     * @param {*} message 
     * @param {*} description 
     */
    constructor(status = 500, message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR_500,
        description = ERROR_MESSAGES.CONTACT_ADMINISTRATOR) {
        super(message);
        this.message = message;
        this.status = status;
        this.description = description;
    }
  }

class ClientError extends Error {
    /**
     * 
     * @param {*} status 
     * @param {*} message 
     * @param {*} description 
     */
    constructor(status, message, description ='') {
        super(message);
        this.message = message;
        this.status = status;
        this.description = description;
    }
}

class Status {
    /**
     * 
     * @param {number} [code=200] - Default is 200 (OK)
     * @param {string} [message='']
     * @param {string} [description='']
     */
    constructor(code = 200, message = '', description = '') {
        this.code = code;
        this.message = message;
        this.description = description;
    }
}

class Pagination {
    /**
     * 
     * @param {*} sortColumn 
     * @param {*} sortDirection 
     * @param {*} total 
     * @param {*} pageSize 
     * @param {*} pageIndex 
     * @param {*} hasMore 
     */
    constructor(sortColumn, sortDirection ='asc', total = 1, pageSize = 10, pageIndex = 1, hasMore) {
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

function handleError(err, req, res, next) {
  logger.exception(err);
  if (err instanceof NoResponseError) {
    return;
  } else {
    if (req.audit) {
      req.audit.message += 'Message Logged: ' + (err.message || err.description);
      req.audit.stackError += err.stack;
      req.audit.status = AUDIT_STATUS.FAILED;
    }
    return sendResponse(req, res, next, {}, new Status(err.status || 500, err.message, err.description));
  }
}

function sendResponse(req, res, next, items = {}, statusModel = new Status(), pagination = '') {
    const response = {};
    
    if (items != null) {
      response['data'] = items; 
    } else {
      response['data'] = {};        
    }
    
  
    if (pagination) {
      response['pagination'] =
          {
            'total': pagination.total,
            'sort': {
              'column': pagination.sortColumn,
              'direction': pagination.sortDirection,
            },
            'pageSize': pagination.pageSize,
            'pageIndex': pagination.pageIndex,
            'nextToken': pagination.nextToken,
            'executionId': pagination.executionId,
          };
      if (pagination.hasMore != null) {
        response.pagination.hasMore = pagination.hasMore;
      }
    }
  
    response.status = createStatusObject(statusModel);
  
    res.status(statusModel.code).send(response);
    if (req.audit) {
      next();
    }
  };

function createStatusObject(statusModel) {
    const status = {};
    switch (statusModel.code) {
    case 206:
      status.type = STATUS_TYPE.PARTIAL_SUCCESS;
      break;
    case 299:
      status.type = STATUS_TYPE.WARNING;
      break;
    case 200:
    case 201:
    case 202:
    case 203:
    case 204:
    case 205:
      status.type = STATUS_TYPE.SUCCESS;
      break;
  
    case 301:
    case 302:
    case 303:
    case 304:
      status.type = STATUS_TYPE.INFO;
      break;
  
  
    case 500:
    case 501:
    case 503:
    case 400:
    case 401:
    case 403:
    case 404:
    case 405:
    case 409:
    case 428:
    case 412:
      status.type = STATUS_TYPE.ERROR;
      break;
    }
    status.message = statusModel.message;
    if (statusModel.description) {
      status.description = statusModel.description;
    }
  
    return status;
  }


/**
 * Send a standardised success response.
 *
 * @param {object}           res      - Express response object
 * @param {string}           message  - Human-readable success message
 * @param {*}                [data=null]   - Payload to return
 * @param {object|Meta|null} [meta=null]  - Pagination metadata ({ page, limit, total, totalPages })
 * @param {number}           [httpStatus=200] - HTTP status code to send
 *
 * @example
 * successResponse(res, 'User fetched successfully', user);
 * successResponse(res, 'Users listed', users, { page:1, limit:10, total:120, totalPages:12 });
 */
function successResponse(res, message, data = null, meta = null, httpStatus = 200) {
  const body = new SuccessResponse(message, data, meta);
  return res.status(httpStatus).json(body);
}

/**
 * Send a standardised error response.
 *
 * @param {object}                  res                - Express response object
 * @param {string}                  message            - Human-readable error message
 * @param {string}                  code               - Error code (string only, e.g. 'USER_NOT_FOUND')
 * @param {number}                  [httpStatus=500]   - Actual HTTP status code
 * @param {Array<ErrorDetail>|null} [details=null]     - Optional per-field validation details
 * @param {boolean}                 [maskError=false]  - When true: HTTP is always 500.
 * @param {number}                  [maskedStatusCode=500] - When masked: body.error.statusCode = this.
 *                                                       Use to identify the error (e.g. 1001). Default 500.
 *
 * @example
 * // Unmasked - code is string, statusCode reflects HTTP
 * errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
 * // → HTTP 404  |  body.error.code = 'USER_NOT_FOUND'  |  body.error.statusCode = 404
 *
 * @example
 * // Unmasked DB error
 * errorResponse(res, 'Database connection failed', 'DB_CONNECTION_FAILED', 503);
 * // → HTTP 503  |  body.error.code = 'DB_CONNECTION_FAILED'  |  body.error.statusCode = 503
 *
 * @example
 * // Masked: HTTP 500, code stays string, statusCode = custom identifier
 * errorResponse(res, 'Database connection failed', 'DB_CONNECTION_FAILED', 503, null, true, 1001);
 * // → HTTP 500  |  body.error.code = 'DB_CONNECTION_FAILED'  |  body.error.statusCode = 1001
 *
 * @example
 * // Validation error with field details
 * const details = [new ErrorDetail('email', 'Email is required')];
 * errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 422, details);
 */
function errorResponse(res, message, code, httpStatus = 500, details = null, maskError = false, maskedStatusCode = 500) {
  const httpStatusToSend = maskError ? 500 : httpStatus;
  const bodyStatusCode = maskError ? maskedStatusCode : httpStatus;
  const codeStr = typeof code === 'string' ? code : String(code);
  const body = new ErrorResponse(message, codeStr, bodyStatusCode, details);
  return res.status(httpStatusToSend).json(body);
}

/**
 * Send a standardised error response directly from an AppError instance.
 *
 * @param {object}   res                  - Express response object
 * @param {AppError} appError             - The caught AppError (.message, .code, .statusCode, .details, .errorNumber)
 * @param {boolean}  [maskError=false]    - When true: HTTP is 500; body.error.statusCode = appError.errorNumber or 500
 * @param {number}   [maskedStatusCode]   - Override for body.error.statusCode when masked (default: appError.errorNumber or 500)
 */
function errorResponseFromError(res, appError, maskError = false, maskedStatusCode) {
  const message    = appError.message     || 'An error occurred';
  const code       = typeof appError.code === 'string' ? appError.code : String(appError.code || 'INTERNAL_ERROR');
  const statusCode = appError.statusCode  || 500;
  const details    = appError.details     || null;
  const masked     = maskedStatusCode ?? appError.errorNumber ?? 500;
  return errorResponse(res, message, code, statusCode, details, maskError, masked);
}

module.exports = {
  // ── Legacy exports (unchanged) ───────────────────────────────────
  NoResponseError,
  ServerError,
  ClientError,
  Status,
  Pagination,
  handleError,
  sendResponse,
  // ── Standardised response helpers ────────────────────────────────
  successResponse,
  errorResponse,
  errorResponseFromError,
  SuccessResponse,
  ErrorResponse,
  Meta,
  ErrorDetail,
  // ── Custom error / catalog system ────────────────────────────────
  AppError,
  createErrorCatalog,
};
