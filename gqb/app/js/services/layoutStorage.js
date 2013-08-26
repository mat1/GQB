'use strict';

/**
 * Converts and stores the forced graph layout on the webserver.
 */
gqb.services.factory('LayoutStorage', function($log, $http) {
  var LayoutStorage = {};

  var Layout = function() {
    this.nodes = [];
    this.edges = [];
    this.enums = [];
  };
  
  /**
   * Converts the d3js force-directed graph to the schema graph and stores
   * the layout over HTTP POST on the webserver.
   * 
   * https://github.com/mbostock/d3/wiki/Force-Layout#wiki-force
   * 
   * @param {d3js force-directed graph} forceGraph
   * @returns {void}
   */
  LayoutStorage.save = function(forceGraph) {
    var layout = new Layout();

    _.each(forceGraph.nodes, function(n) {
      var newNode = angular.copy(n);
      newNode.left = parseInt(getLeftPosition(n), 10);
      newNode.top = parseInt(getTopPosition(n), 10);
      
      // Delete not more used properties to save space
      delete newNode.index;
      delete newNode.px;
      delete newNode.py;
      delete newNode.x;
      delete newNode.y;
      delete newNode.weight;
      delete newNode.fixed;

      layout.nodes.push(newNode);
    });

    _.each(forceGraph.edges, function(e) {
      var newEdge = angular.copy(e);
      
      // Remove circular dependencies to avoid JSON.stringify errors
      // (TypeError: Converting circular structure to JSON)
      var source = {x: parseInt(e.source.x, 10), y: parseInt(e.source.y, 10)};
      var target = {x: parseInt(e.target.x, 10), y: parseInt(e.target.y, 10)};

      newEdge.source = source;
      newEdge.target = target;

      layout.edges.push(newEdge);
    });

    layout.enums = forceGraph.enums;

    saveLayout(layout);
  };

  function getLeftPosition(node) {
    return node.x - (node.width / 2);
  }

  function getTopPosition(node) {
    return node.y - (node.height / 2);
  }

  function saveLayout(layout) {
    var json = JSON.stringify(layout);
   
    $log.log('Try to save layout on server.');
    $log.log(json);
    
    $http.post('server/layout.php', json).success(function() {
      $log.log('Layout saved on server.');
    }).error(function(data, status) {
      $log.error('Can not save layout on server. Response: ' + data + ' Status: ' + status);
    });
  }

  return LayoutStorage;
});
