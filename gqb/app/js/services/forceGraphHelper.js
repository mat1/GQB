'use strict';

gqb.services.factory('ForceGraphHelper', function() {
  var ForceGraphHelper = {};

  ForceGraphHelper.mapEdgesToNodes = function(edges, nodes) {
    var nodeByName = [];

    _.each(nodes, function(node) {
      nodeByName[node.name] = node;
    });

    edges = _.map(edges, function(edge) {
      edge.source = nodeByName[edge.fromSchemaNode];
      edge.target = nodeByName[edge.toSchemaNode];
      return edge;
    });
  };

  ForceGraphHelper.markOverlappingEdges = function(edges) {
    _.each(edges, function(edge) {
      var overlappings = _.filter(edges, function(otherEdge) {
        return edge !== otherEdge && connectsSameNode(edge, otherEdge);
      });

      edge.overlappings = overlappings.length;
    });
  };

  function connectsSameNode(edge, otherEdge) {
    return (edge.fromSchemaNode === otherEdge.fromSchemaNode && edge.toSchemaNode === otherEdge.toSchemaNode) ||
           (edge.toSchemaNode === otherEdge.fromSchemaNode && edge.fromSchemaNode === otherEdge.toSchemaNode);
  }

  ForceGraphHelper.markNodesWithLoop = function(edges, nodes) {
    _.each(nodes, function(node) {
      node.hasLoop = false;
    });

    _.each(edges, function(edge) {
      if (edge.source === edge.target) {
        edge.source.hasLoop = true;
      }
    });
  };

  return ForceGraphHelper;
});
