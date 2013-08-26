'use strict';

gqb.ctrls.controller('ResultViewCtrl', function($scope, QueryBuilder, TrailsWebService, ResultHelper, Event) {
  $scope.limit = QueryBuilder.getLimit();
  $scope.showView = 'List';
  $scope.showLimit = true;

  resetResults();

  function resetResults() {
    $scope.queryIsRunning = false;
    $scope.elementInfo = null;
    $scope.error = null;
    $scope.jobId = null;

    $scope.graphUrlDot = null;
    $scope.graphUrlSfdp = null;
    $scope.paths = null;
    $scope.trees = null;

    $scope.hideDownloadDialog = true;
  }

  $scope.$on(Event.DSL_CHANGED, function(event, dsl) {
    if (dsl === '') {
      resetResults();
      // TrailsWebService.cancelLastJob();
    } else {
      $scope.limit = QueryBuilder.getLimit();
      $scope.queryIsRunning = true;
      // TrailsWebService.executeQuery(dsl, onQueryExecuted);
    }
  });

  function onQueryExecuted(jobId, result, success) {
    resetResults();
    $scope.jobId = jobId;

    if (success) {
      $scope.graphUrlDot = TrailsWebService.getGraphUrl(jobId, 'dot');
      $scope.graphUrlSfdp = TrailsWebService.getGraphUrl(jobId, 'sfdp');
      $scope.paths = ResultHelper.extractPaths(result);
      $scope.trees = ResultHelper.extractTrees($scope.paths);
    } else {
      $scope.error = result.message;
    }
  }

  $scope.$on(Event.SHOW_NODE_INFO, function(event, id) {
    $scope.$apply($scope.showNodeInfo(id));
  });

  $scope.$on(Event.SHOW_GRAPH, function(event, show) {
    $scope.showLimit = show;
  });

  $scope.setLimit = function() {
    if (isFormValid()) {
      QueryBuilder.setLimit($scope.limit);
    }
  };

  function isFormValid() {
    return !$scope.form.$invalid;
  }

  $scope.setView = function(view) {
    $scope.elementInfo = null;
    $scope.showView = view;
  };

  $scope.isNode = function(element) {
    return element.kind === ResultHelper.NODE_KIND;
  };

  $scope.getEdgeDirection = function(edge) {
    return parseInt(edge.id, 10) > 0 ? '→' : '←';
  };

  var ElementInfo = function(id, name, idProperties, properties) {
    this.id = id;
    this.name = name;
    this.idProperties = idProperties;
    this.properties = properties;
  };

  $scope.showNodeInfo = function(id) {
    TrailsWebService.getNodeInfo(id, function(data) {
      $scope.elementInfo = new ElementInfo(data.nodeId, data.nodeType, data.idProperties, data.properties);
    });
  };

  $scope.showEdgeInfo = function(id) {
    TrailsWebService.getEdgeInfo(id, function(data) {
      $scope.elementInfo = new ElementInfo(data.edgeId, data.relationshipType, {EdgeId: data.edgeId}, data.properties);
    });
  };

  // Download Dialog
  $scope.hideDownloadDialog = true;
  $scope.download = {};
  $scope.download.format = 'pdf';
  $scope.download.layout = 'dot';
  $scope.download.aggregated = 'true';

  $scope.showDownloadDialog = function() {
    $scope.hideDownloadDialog = false;
  };

  $scope.closeDownloadDialog = function() {
    $scope.hideDownloadDialog = true;
  };

  $scope.getDownloadUrl = function() {
    return TrailsWebService.getDownloadUrl($scope.jobId, $scope.download.format, $scope.download.layout, $scope.download.aggregated);
  };

});