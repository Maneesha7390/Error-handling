const logger = require('./shared/utils/logger')
const ERROR_MESSAGES = require('./shared/enums/error-messages')
const AUDIT_STATUS = require('./shared/enums/audit-logs-enums').Status

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


module.exports = {
  NoResponseError,
  ServerError,
  ClientError,
  Status,
  Pagination,
  handleError,
  sendResponse
};
