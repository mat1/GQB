'use strict';

/**
 * The path service provides funtions to get the reachable elements and the
 * edges which connects two nodes.
 */
gqb.services.factory('Path', function() {
  var Path = {};

  var edges = null;
  var nodeByName = [];

  Path.init = function(newEdges, nodes) {
    edges = newEdges;

    _.each(nodes, (function(node) {
      nodeByName[node.name] = node;
    }));
  };

  /**
   * Returns all direct reachable nodes and edges from a node except the node himself.
   * 
   * @param {String} name of the node
   * @returns {Array} all direct reachable nodes and edges
   */
  Path.getReachableElements = function(name) {
    var results = [];

    _.each(edges, (function(edge) {
      if (edge.fromSchemaNode === name) {
        addIfNotContains(results, edge);

        if (edge.toSchemaNode !== name) {
          addIfNotContains(results, nodeByName[edge.toSchemaNode]);
        }
      }
      if (edge.toSchemaNode === name) {
        addIfNotContains(results, edge);

        if (edge.fromSchemaNode !== name) {
          addIfNotContains(results, nodeByName[edge.fromSchemaNode]);
        }
      }
    }));

    return results;
  };

  function addIfNotContains(array, element) {
    if (array.indexOf(element) === -1) {
      array.push(element);
    }
  }
  
  /**
   * Retunrs all edges which connects the two nodes.
   * 
   * @param {String} fromNode name of the start node 
   * @param {String} toNode name of the node to
   * @returns {Array} all edges which connects the two nodes
   */
  Path.getEdgesToNode = function(fromNode, toNode) {
    var results = [];

    _.each(edges, (function(edge) {
      if (edge.fromSchemaNode === fromNode && edge.toSchemaNode === toNode ||
          edge.fromSchemaNode === toNode && edge.toSchemaNode === fromNode) {
        results.push(edge);
      }
    }));

    return results;
  };

  return Path;
});
