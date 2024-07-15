
const { isArray } = require('lodash');
const STATUS_TYPE = require('./enums/response-status');
const Status = require('./models/status.model');

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} data
 * @param {Status} statusModel
 * @param {*} pagination
 */
module.exports = function(req, res, next, items = {}, statusModel = new Status(), pagination = '') {
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

/**
* Get status object based on status code
* @param {Status} statusModel
* @return {object} status object
*/
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
