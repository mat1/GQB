'use strict';

gqb.ctrls.controller('GraphCtrl', function($scope, QueryBuilder, Path, Graph, QM, Event) {
  $scope.mode = QM.ElementMode.FOLLOW;

  $scope.isBranchMode = false;
  $scope.isSubQueryMode = false;

  $scope.$on(Event.GRAPH_LOADED, function(event, schema) {
    $scope.edges = schema.edges;
    $scope.nodes = schema.nodes;

    Path.init($scope.edges, $scope.nodes);
    updateActiveNode();
  });

  Graph.init();

  $scope.$on(Event.ACTIVE_QM_NODE_CHANGED, updateActiveNode);

  function updateActiveNode() {
    $scope.activeNode = QueryBuilder.getActiveQmNode();
    $scope.selectEdges = null;

    if ($scope.activeNode === null) {
      Graph.initElements();
      $scope.isBranchMode = false;
      $scope.isSubQueryMode = false;
    } else {
      setReachableElements();
      setPath();
      Graph.setActiveNode($scope.activeNode);

      $scope.isBranchMode = QueryBuilder.getMode() === QM.ElementMode.BRANCH;
      $scope.isSubQueryMode = QueryBuilder.getMode() === QM.ElementMode.SUB_QUERY;
    }
  }

  function setReachableElements() {
    var node = QueryBuilder.getLastNode();
    var reachElements = Path.getReachableElements(node.name);

    Graph.initElements();
    Graph.setReachableElements(reachElements);
  }

  function setPath() {
    Graph.setPath(QueryBuilder.getFlatPath());
  }

  $scope.selectLoop = function(node) {
    node.state = QM.ElementState.REACHABLE;
    $scope.selectNode(node);
  };

  $scope.selectNode = function(node) {
    if (node.state === QM.ElementState.REACHABLE) {
      if (!QueryBuilder.isEmpty()) {
        // If not first element, get last added node.
        var lastNode = QueryBuilder.getLastNode();
        var edges = Path.getEdgesToNode(lastNode.name, node.name);

        if (edges.length === 1) {
          QueryBuilder.addEdge(edges[0].name);
        } else {
          Graph.setReachableElements([]);
          showSelectEdge(edges, node);
          return;
        }
      }
      QueryBuilder.addNode(node.name);
    }
  };

  $scope.removeNode = function(node) {
    QueryBuilder.removeNode(node.queryid);
  };

  $scope.canStartBranch = function() {
    return !$scope.isBranchMode &&
            !$scope.isSubQueryMode &&
            _.isObject($scope.activeNode) &&
            $scope.activeNode.mode === QM.ElementMode.FOLLOW &&
            $scope.activeNode.id === _.last(QueryBuilder.getQuery().elements).id;
  };

  $scope.startBranch = function() {
    if ($scope.canStartBranch()) {
      $scope.isBranchMode = true;
      QueryBuilder.startBranch();
    }
  };

  $scope.canFinishBranch = function() {
    return QueryBuilder.canFinishBranch();
  };

  $scope.finishBranch = function() {
    if (QueryBuilder.canFinishBranch()) {
      $scope.isBranchMode = false;
      QueryBuilder.finishBranch();
    }
  };
  $scope.canStartSubQuery = function() {
    return !$scope.isSubQueryMode &&
            !$scope.isBranchMode &&
            _.isObject($scope.activeNode) &&
            $scope.activeNode.mode === QM.ElementMode.FOLLOW;
  };

  $scope.startSubQuery = function() {
    if ($scope.canStartSubQuery()) {
      $scope.isSubQueryMode = true;
      QueryBuilder.startSubQuery();
    }
  };

  $scope.finishSubQuery = function() {
    $scope.isSubQueryMode = false;
    QueryBuilder.finishSubQuery();
  };

  /**
   * Select Edge Dialog
   * 
   * @param {[schemaEdge]} edges wich can be selected
   * @param {schmeaNode} node to add if user selects an edge
   * @returns {void}
   */
  function showSelectEdge(edges, node) {
    var dragContainer = angular.element('.dragcontainer');

    var left = dragContainer[0].offsetLeft + node.left;
    var top = dragContainer[0].offsetTop + node.top;

    $scope.nodeToAdd = node;
    $scope.selectTop = top + 'px';
    $scope.selectLeft = left + 'px';
    $scope.selectEdges = edges;
    $scope.selectedEdge = edges[0];
  }

  $scope.selectEdge = function(edge) {
    QueryBuilder.addEdge(edge.name);
    QueryBuilder.addNode($scope.nodeToAdd.name);
    $scope.selectEdges = null;
  };

  $scope.cancelSelectEdge = function() {
    $scope.selectEdges = null;
    updateActiveNode();
  };

  /**
   * Hides an edge, if an overlapping edge was selected. 
   * @param {schemaEdge} edge
   * @returns {String} opacity 1.0 = visible, 0.0 = invisible
   */
  $scope.getEdgeOpacity = function(edge) {
    switch (edge.mode) {
      case QM.ElementMode.NOT_SELECTED:
        if (edge.overlappings === 0) {
          return '1.0';
        } else {
          for (var i = 0; i < $scope.edges.length; i++) {
            var otherEdge = $scope.edges[i];
            if (edge !== otherEdge) {
              if (otherEdge.mode !== QM.ElementMode.NOT_SELECTED) {
                if (connectsSameNode(edge, otherEdge)) {
                  return '0.0';
                }
              }
            }
          }
        }
        return '1.0';

      case QM.ElementMode.FOLLOW:
      case QM.ElementMode.SUB_QUERY:
      case QM.ElementMode.BRANCH:
        return '1.0';
    }
  };

  function connectsSameNode(edge, otherEdge) {
    return (edge.fromSchemaNode === otherEdge.fromSchemaNode && edge.toSchemaNode === otherEdge.toSchemaNode) ||
           (edge.toSchemaNode === otherEdge.fromSchemaNode && edge.fromSchemaNode === otherEdge.toSchemaNode);
  }

});