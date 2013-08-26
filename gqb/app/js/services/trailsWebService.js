'use strict';

/**
 * This service is responsible for the communcation wiht the trails web service.
 * Provide functions to execute a query and to get the results.
 */
gqb.services.factory('TrailsWebService', function($http, $log, WEBSERVICE_URL) {
  var TrailsWebService = {};

  var URL = WEBSERVICE_URL;

  var lastJobId = null;
  var cancledJobs = [];

  /**
   * Creates a new query job, cancel the last query job and gets the result from the
   * new query. Calls the callback function when the response is available.
   * 
   * <pre>
   * TrailsWebService.executeQuery('V(Ticket)', function(jobId, result, success){
   *  ...
   * });
   * </pre>
   * 
   * @param {String} dsl
   * @param {function} callback will be called when the response is available
   * @returns {void}
   */
  TrailsWebService.executeQuery = function(dsl, callback) {
    $http({method: 'GET', url: URL + 'bf/jobs/execute/' + dsl, withCredentials: true}).success(function(jobId) {
      if (lastJobId !== null) {
        cancelJob(lastJobId);
      }
      lastJobId = jobId;

      getResult(jobId, callback);
    }).error(logError);
  };

  TrailsWebService.cancelLastJob = function() {
    if (lastJobId !== null) {
      cancelJob(lastJobId);
    }
  };

  function getResult(jobId, callback) {
    $http({method: 'GET', url: URL + 'bf/jobs/results/' + jobId, withCredentials: true}).success(function(data) {
      if (jobId >= lastJobId && !_.contains(cancledJobs, jobId)) {
        if (data.resultType === 'Error') {
          callback(jobId, data, false);
        } else {
          callback(jobId, data, true);
        }
      }
    }).error(logError);
  }

  function cancelJob(jobId) {
    cancledJobs.unshift(jobId);

    $http({method: 'GET', url: URL + 'bf/jobs/cancel/' + jobId, withCredentials: true}).error(logError);
  }

  TrailsWebService.getNodeInfo = function(nodeId, callback) {
    $http({method: 'GET', url: URL + 'bf/nodes/' + nodeId, withCredentials: true}).success(function(data) {
      callback(data);
    }).error(logError);
  };

  TrailsWebService.getEdgeInfo = function(edgeId, callback) {
    $http({method: 'GET', url: URL + 'bf/edges/' + edgeId, withCredentials: true}).success(function(data) {
      callback(data);
    }).error(logError);
  };

  TrailsWebService.getGraphUrl = function(jobId, layout) {
    return URL + 'bf/jobs/results/' + jobId + '.xml?layout=' + layout + '&titled=false&noCache=' + new Date().getTime();
  };

  TrailsWebService.getDownloadUrl = function(jobId, format, layout, aggregated) {
    return URL + 'bf/jobs/results/' + jobId + '.' + format + '?layout=' + layout + '&aggregated=' + aggregated;
  };

  TrailsWebService.getSchema = function(callback) {
    $http({method: 'GET', url: 'data/schema.json'}).success(function(data) {
      callback(data);
    }).error(logError);
  };

  function logError(data, status) {
    $log.error('Error during communication with web service. Response: ' + data + ' Status: ' + status);
  }

  return TrailsWebService;
});