'use strict';

/**
 * Main controller for the query page. Generates the query url and loads the query 
 * from the url when the query page is loaded. 
 * Compares the local schema with the schema from the web service.
 */
gqb.ctrls.controller('QueryCtrl', function($scope, $location, QueryBuilder, DslGenerator, QM, TrailsWebService, SchemaComparator, Event) {
  $scope.showGraph = true;
  $scope.areSchemasEqual = true;

  $scope.$on(Event.GRAPH_LOADED, function(event, localSchema) {
    loadQueryFromUrl();
    compareSchemaWithWebservice(localSchema);
  });

  function loadQueryFromUrl() {
    var params = $location.search();

    if (_.has(params, 'query')) {
      var query = JSON.parse(params.query);
      QueryBuilder.setQueryFromJsonObject(query);
    }
  }

  function compareSchemaWithWebservice(localSchema) {
    TrailsWebService.getSchema(function(schema) {
      $scope.areSchemasEqual = SchemaComparator.equals(schema, localSchema);
    });
  }

  $scope.$on(Event.QUERY_CHANGED, function() {
    $scope.activeQmNode = QueryBuilder.getActiveQmNode();

    var dsl = DslGenerator.generateDsl(QueryBuilder.getQuery());
    Event.notifyDslChanged(dsl);

    if (QueryBuilder.isEmpty()) {
      $location.search({});
    } else {
      if (QueryBuilder.getMode() !== QM.ElementMode.BRANCH) {
        $location.search({query: JSON.stringify(QueryBuilder.getQuery())});
      }
    }
  });

  $scope.$on(Event.SHOW_GRAPH, function(event, show) {
    $scope.showGraph = show;
  });

});