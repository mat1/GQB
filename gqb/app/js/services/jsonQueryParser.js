'use strict';

/**
 * Parse an json object and retuns a QM.Query object.
 */
gqb.services.factory('JsonQueryParser', function(QM, Graph) {
  var JsonQueryParser = {};
  
  /**
   * Parse an json object and retuns a QM.Query object.
   * Throws an error if the nodes and edges not exsists in the graph.
   * 
   * @param {JSON} jsonObject
   * @returns {QM.Query} new QM.Query
   */
  JsonQueryParser.parse = function(jsonObject) {
    var result = new QM.Query();
    result.elements = parseElements(jsonObject.elements);
    result.limit = jsonObject.limit;
    return result;
  };

  function parseElements(elements) {
    var results = [];

    _.each(elements, function(element) {
      if (element.type === 'QM.Edge') {
        results.push(parseEdge(element));
      }
      if (element.type === 'QM.Node') {
        results.push(parseNode(element));
      }
    });

    return results;
  }

  function parseNode(object) {
    // Check if node exsists
    Graph.getNodeByName(object.name);

    var node = new QM.Node(object.name, object.mode);
    node.filter = parseFilter(object.filter);
    node.subQuery = parseElements(object.subQuery);
    _.each(object.branches, function(branch) {
      node.branches.push(parseElements(branch));
    });
    return node;
  }

  function parseEdge(object) {
    // Check if edge exsists
    Graph.getEdgeByName(object.name);

    var edge = new QM.Edge(object.name, object.mode);
    edge.filter = parseFilter(object.filter);
    return edge;
  }

  function parseFilter(filter) {
    var results = [];
    _.each(filter, function(expr) {
      if (expr.type === 'QM.PropertyExpr') {
        results.push(parsePropertyExpr(expr));
      }
      if (expr.type === 'QM.BoolExpr') {
        results.push(parseBoolExpr(expr));
      }
    });
    return results;
  }

  function parsePropertyExpr(expr) {
    return new QM.PropertyExpr(expr.property, expr.opr, expr.literal);
  }

  function parseBoolExpr(expr) {
    return new QM.BoolExpr(expr.opr);
  }

  return JsonQueryParser;
});