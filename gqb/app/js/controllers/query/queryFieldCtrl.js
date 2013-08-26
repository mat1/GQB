'use strict';

gqb.ctrls.controller('QueryFieldCtrl', function($scope, $window, QueryBuilder, History, Event) {
  var Mode = {
    GRAPH_VIEW: 'GRAPH_VIEW',
    QUERY_VIEW: 'QUERY_VIEW'
  };

  $scope.query = '';
  var oldQuery = $scope.query;

  $scope.mode = Mode.GRAPH_VIEW;
  $scope.showGraph = true;
  $scope.historyElements = History.getElements();

  $scope.$on(Event.DSL_CHANGED, function(event, dsl, byUser) {
    if (byUser) {
      // do nothing if user changed query manually
    } else {
      $scope.query = dsl;
      History.add(dsl, QueryBuilder.getQuery());
      $scope.historyElements = History.getElements();
    }
  });

  $scope.reset = function() {
    QueryBuilder.init();
  };

  $scope.runQuery = function() {
    Event.notifyDslChanged($scope.query, true);
  };

  $scope.editQuery = function() {
    oldQuery = $scope.query;
    $scope.mode = Mode.QUERY_VIEW;
    showGraph(false);
  };

  $scope.backToGraph = function() {
    if ($window.confirm('If you go back to the graph view, you lose your query modifications!')) {
      $scope.mode = Mode.GRAPH_VIEW;
      $scope.query = oldQuery;
      $scope.runQuery();
      showGraph(true);
    }
  };

  $scope.toggleShowGraph = function() {
    if ($scope.showGraph) {
      showGraph(false);
    } else {
      showGraph(true);
    }
  };

  $scope.isGraphView = function() {
    return $scope.mode === Mode.GRAPH_VIEW;
  };

  $scope.isQueryView = function() {
    return $scope.mode === Mode.QUERY_VIEW;
  };

  var showGraph = function(show) {
    $scope.showGraph = show;
    Event.notifyShowGraph(show);
  };

  $scope.selectHistoryElement = function() {
    if ($scope.history !== null) {
      QueryBuilder.setQueryFromJsonObject($scope.history.query);
    }
  };
});