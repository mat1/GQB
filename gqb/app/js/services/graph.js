'use strict';

/**
 * The Graph service holds the schema nodes and edges and provides functions
 * to set the reachability, the path and to accesss a node or an edge.
 */
gqb.services.factory('Graph', function($http, QM, Enums, Event) {
  var Graph = {};

  var edges = null;
  var nodes = null;

  /**
   * Loads the schema from the web server and fires the graphLoaded event
   * when the schema is loaded and initialized.
   * This function has to be called before using any other function from this
   * service.
   * 
   * @returns {void}
   */
  Graph.init = function() {
    $http.get('data/graph.json').success(function(schema) {
      edges = schema.edges;
      nodes = schema.nodes;
      Enums.init(schema.enums);
      Graph.initElements();
      Event.notifyGraphLoaded(schema);
    });
  };

  Graph.initElements = function() {
    _.each(nodes, function(node) {
      node.state = QM.ElementState.REACHABLE;
      node.mode = QM.ElementMode.NOT_SELECTED;
    });
    _.each(edges, function(edge) {
      edge.state = QM.ElementState.REACHABLE;
      edge.mode = QM.ElementMode.NOT_SELECTED;
    });
  };

  Graph.setReachableElements = function(reachElements) {
    setReachableElements(edges, reachElements);
    setReachableElements(nodes, reachElements);
  };

  function setReachableElements(elements, reachElements) {
    _.each(elements, function(element) {
      if (containsElement(reachElements, element)) {
        element.state = QM.ElementState.REACHABLE;
      } else {
        element.state = QM.ElementState.NOT_REACHABLE;
      }
    });
  }

  function containsElement(elements, element) {
    var result = _.findWhere(elements, {name: element.name});
    return _.isObject(result);
  }

  Graph.setPath = function(qmElements) {
    _.each(qmElements, function(qmElement) {
      var element = Graph.getElementByQmElement(qmElement);
      element.mode = qmElement.mode;
    });

  };

  Graph.setActiveNode = function(activeNode) {
    var node = Graph.getNodeByName(activeNode.name);
    node.state = QM.ElementState.ACTIVE;
    node.queryid = activeNode.id;
  };

  Graph.getElementByQmElement = function(qmElement) {
    if (qmElement instanceof QM.Node) {
      return Graph.getNodeByName(qmElement.name);
    }
    if (qmElement instanceof QM.Edge) {
      return Graph.getEdgeByName(qmElement.name);
    }
    throw new Error('Element has to be an QM.Edge or an QM.Node: ' + qmElement);
  };

  /**
   * Returns the schema edge with the specified name. 
   * The edge names must be unique.
   *  
   * @param {String} name
   * @returns {SchemaEdge} edge
   */
  Graph.getEdgeByName = function(name) {
    var edge = _.findWhere(edges, {name: name});
    if (_.isUndefined(edge)) {
      throw new Error('Graph contains no edge with name: ' + name);
    }
    return edge;
  };

  /**
   * Returns the schema node with the specified name. 
   * The node names must be unique.
   *  
   * @param {String} name
   * @returns {SchemaNode} node
   */
  Graph.getNodeByName = function(name) {
    var node = _.findWhere(nodes, {name: name});
    if (_.isUndefined(node)) {
      throw new Error('Graph contains no node with name: ' + name);
    }
    return node;
  };

  return Graph;
});
