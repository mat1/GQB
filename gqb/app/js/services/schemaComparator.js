'use strict';

gqb.services.factory('SchemaComparator', function() {
  var SchemaComparator = {};
  
  /**
   * Compares two JSON Graph Schema schemas and returns true if both schemas are equal.
   * 
   * @param {JSON Graph Schema} schema
   * @param {JSON Graph Schema} other
   * @returns {Boolean} true if the schemas are equal
   */
  SchemaComparator.equals = function(schema, other) {
    return areNodesEqual(schema, other) && areEdgesEqual(schema, other) && _.isEqual(schema.enums, other.enums);
  };

  function areNodesEqual(schema, other) {
    return _.every(schema.nodes, function(node, index) {
      var otherNode = other.nodes[index];
      return _.isEqual(node.name, otherNode.name) &&
             _.isEqual(node.properties, otherNode.properties);
    });
  }

  function areEdgesEqual(schema, other) {
    return _.every(schema.edges, function(edge, index) {
      var otherEdge = other.edges[index];
      return _.isEqual(edge.name, otherEdge.name) &&
             _.isEqual(edge.fromSchemaNode, otherEdge.fromSchemaNode) &&
             _.isEqual(edge.toSchemaNode, otherEdge.toSchemaNode) &&
             _.isEqual(edge.properties, otherEdge.properties);
    });
  }

  return SchemaComparator;
});
