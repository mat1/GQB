'use strict';

/**
 * The Query Builder service manages the query creation. The Query Builder broadcasts a
 * queryChanged event if the query has changed and a activeQmNodeChanged event if the 
 * active node has changed.
 * 
 * Example query:
 * <pre>
 * QueryBuilder.addNode('Package');
 * QueryBuilder.addEdge('Test');
 * QueryBuilder.addNode('PckService');
 * console.log(QueryBuilder.toString());
 * </pre>
 *  
 */
gqb.services.factory('QueryBuilder', function($log, QM, QueryHelper, JsonQueryParser, Event) {
  var QueryBuilder = {};

  var query, head, activeQmNode, activeQmEdge, mode;

  /**
   * Initalize an empty query.
   * 
   * @returns {void}
   */
  QueryBuilder.init = function() {
    query = new QM.Query();

    /**
     * Reference to current head. All new nodes and edges are added to the head.
     * For example QueryBuilder.addNode(..) adds a new node at the end of the head.
     */
    head = query.elements;
    
    activeQmNode = null;
    activeQmEdge = null;

    mode = QM.ElementMode.FOLLOW;

    notifyQueryChanged();
    notfiyActiveNodeChanged();
  };

  QueryBuilder.toString = function() {
    return query.toString();
  };

  QueryBuilder.setQueryFromJsonObject = function(jsonObject) {
    try {
      query = JsonQueryParser.parse(jsonObject);
      head = query.elements;

      QueryBuilder.setActiveQmNode(_.last(head).id);
      notifyQueryChanged();
    } catch (error) {
      $log.log('Error during query parsing. ' + error);
    }
  };

  QueryBuilder.getQuery = function() {
    return query;
  };

  QueryBuilder.getLimit = function() {
    return query.limit;
  };

  QueryBuilder.setLimit = function(newLimit) {
    query.limit = newLimit;
    notifyQueryChanged();
  };

  QueryBuilder.getMode = function() {
    return mode;
  };

  QueryBuilder.isEmpty = function() {
    return _.isEmpty(query.elements);
  };

  /**
   * Adds a node to the query and sets the active node to the new added node.
   * 
   * @param {String} name of the node
   * @returns {int} query id
   */
  QueryBuilder.addNode = function(name) {
    if (_.last(head) instanceof QM.Node && head.length > 0) {
      throw new Error('You have to add an edge before you can add a node.');
    }

    var node = new QM.Node(name, mode);
    head.push(node);
    QueryBuilder.setActiveQmNode(node.id);
    notifyQueryChanged();

    return node.id;
  };

  /**
   * Adds an edge to the query.
   * 
   * @param {String} name of the edge
   * @returns {int} query id
   */
  QueryBuilder.addEdge = function(name) {
    if (_.last(head) instanceof QM.Edge && head.length > 0) {
      throw new Error('You have to add an node before you can add an edge.');
    }

    var edge = new QM.Edge(name, mode);
    head.push(edge);

    return edge.id;
  };

  QueryBuilder.startSubQuery = function() {
    if (mode === QM.ElementMode.SUB_QUERY) {
      throw new Error('You can not start a subquery in a subquery.');
    }
    if (_.isEmpty(head)) {
      throw new Error('You have to add an edge or a node before you can start a sub query.');
    }

    mode = QM.ElementMode.SUB_QUERY;
    head = _.last(head).subQuery;

    notfiyActiveNodeChanged();
  };

  QueryBuilder.finishSubQuery = function() {
    head = query.elements;
    mode = QM.ElementMode.FOLLOW;
    QueryBuilder.setActiveQmNode(_.last(query.elements).id);
  };

  QueryBuilder.startBranch = function() {
    if (mode === QM.ElementMode.BRANCH) {
      throw new Error('You can not start a branch in a branch.');
    }
    if (_.isEmpty(head)) {
      throw new Error('You have to add an node before you can start a branch.');
    }

    mode = QM.ElementMode.BRANCH;
    var branch = [];
    _.last(head).branches.push(branch);

    head = branch;

    notfiyActiveNodeChanged();
  };

  /**
   * Checks if you can finish a branch. You can finish a branch if
   * all branches ends at the same node.
   * 
   * @returns {Boolean} true if you can finish a branch, false otherwise.
   */
  QueryBuilder.canFinishBranch = function() {
    if (mode === QM.ElementMode.BRANCH) {
      var lastNode = _.last(query.elements);
      if (lastNode.branches.length > 1) {
        var last = _.last(lastNode.branches[0]).name;
        return _.every(_.last(query.elements).branches, function(branch) {
          if (_.isEmpty(branch)) {
            return false;
          } else {
            return _.last(branch).name === last;
          }
        });
      } else {
        // First branch
        return lastNode.branches[0].length > 0;
      }
    }

    return false;
  };

  /**
   * Finishs a branch and set the query mode back to follow.
   * 
   * @returns {void}
   */
  QueryBuilder.finishBranch = function() {
    if (QueryBuilder.canFinishBranch()) {
      head = query.elements;
      mode = QM.ElementMode.FOLLOW;
      QueryBuilder.setActiveQmNode(_.last(head).id);
      notifyQueryChanged();
    }
  };

  QueryBuilder.setFilter = function(elementId, filter) {
    var element = QueryHelper.findElement(query.elements, elementId);

    if (element instanceof QM.Node || element instanceof QM.Edge) {
      element.filter = filter;
      notifyQueryChanged();
    } else {
      throw new Error('A filter can only be added to a node or an edge');
    }
  };

  /**
   * Removes the node with the given query id.
   * It removes all following nodes and edges and if the node is not the first 
   * one it removes the edge before the node.
   * 
   * Example:
   * <pre>
   * 1. A -> B -> C // removeNode(B)
   * 2. A
   * </pre>
   * 
   * @param {int} id query id
   * @returns {void}
   */
  QueryBuilder.removeNode = function(id) {
    var root = QueryHelper.findRoot(query.elements, id);
    var pos = QueryHelper.findElementPosition(root, id);
    var node = root[pos];
    var parentNode = null;

    switch (node.mode) {
      case QM.ElementMode.FOLLOW:
        head = query.elements;
        mode = QM.ElementMode.FOLLOW;

        if (pos === 0) {
          root.splice(pos, root.length);
          QueryBuilder.setActiveQmNode(null);
        } else {
          // Remove edge before node
          root.splice(pos - 1, root.length);
          QueryBuilder.setActiveQmNode(_.last(root).id);
        }
        break;

      case QM.ElementMode.SUB_QUERY:
        if (pos <= 1) {
          parentNode = QueryHelper.findParentNodeInSubQueries(query.elements, id);
          root.splice(0, root.length);
          head = query.elements;
          mode = QM.ElementMode.FOLLOW;
          QueryBuilder.setActiveQmNode(parentNode.id);
        } else {
          // Remove edge before node
          root.splice(pos - 1, root.length);
          QueryBuilder.setActiveQmNode(_.last(root).id);
        }
        break;

      case QM.ElementMode.BRANCH:
        parentNode = QueryHelper.findParentNodeInBranches(query.elements, id);

        // Remove all following elements from the parent node
        var parentPos = QueryHelper.findElementPosition(query.elements, parentNode.id);
        query.elements.splice(parentPos + 1, query.elements.length);
        
        // Remove all branches from parent node
        parentNode.branches = [];
        
        head = query.elements;
        mode = QM.ElementMode.FOLLOW;
        QueryBuilder.setActiveQmNode(parentNode.id);
        break;
    }

    notifyQueryChanged();
  };

  QueryBuilder.getPropertyFilter = function(id) {
    var element = QueryHelper.findElement(query.elements, id);
    return element.filter;
  };

  QueryBuilder.removeExpr = function(id) {
    var filter = QueryHelper.findRoot(query.elements, id);
    var pos = QueryHelper.findExprPosition(filter, id);

    if (pos === 0) {
      filter.splice(pos, 2);
    } else {
      // Remove bool expr above
      filter.splice(pos - 1, 2);
    }

    notifyQueryChanged();
  };

  QueryBuilder.getPath = function() {
    return query.elements;
  };
  
  /**
   * Returns a flatten path. For example the query 
   * A Sub( -> B -> C) -> D => [A, ->, B, ->, C, ->, D]
   * 
   * @returns {Array} list of all nodes and edges in the query.
   */
  QueryBuilder.getFlatPath = function() {
    var path = [];

    _.each(query.elements, function(element) {
      path.push(element);

      // subQuery
      _.each(element.subQuery, function(subElement) {
        path.push(subElement);
      });

      // branch
      _.each(element.branches, function(branch) {
        _.each(branch, function(branchElement) {
          path.push(branchElement);
        });
      });
    });

    return path;
  };
  
  /**
   * Returns the "last node". The last node defines which nodes are reachable. 
   * The reachability depends on the query mode.
   * 
   * @returns {QM.Node} QM.Node
   */
  QueryBuilder.getLastNode = function() {
    var qmNode = null;
    
    switch (mode) {
      case QM.ElementMode.FOLLOW:
        qmNode = _.last(query.elements);
        if (qmNode.hasBranches()) {
          return qmNode.getLastNodeInBranch();
        }
        return qmNode;

      case QM.ElementMode.SUB_QUERY:
        if (activeQmNode.mode === QM.ElementMode.FOLLOW) {
          if (_.isEmpty(activeQmNode.subQuery)) {
            return _.last(query.elements);
          } else {
            var last = _.last(activeQmNode.subQuery);
            QueryBuilder.setActiveQmNode(last.id);
            return last;
          }
        }
        var parentNode = QueryHelper.findParentNodeInSubQueries(query.elements, activeQmNode.id);
        return _.last(parentNode.subQuery);

      case QM.ElementMode.BRANCH:
        qmNode = _.last(query.elements);
        if (qmNode.hasBranches()) {
          if (head.length > 0) {
            return _.last(head);
          } else {
            return qmNode;
          }
        }
        return qmNode;
    }
  };
  
  QueryBuilder.setActiveQmNode = function(id) {
    if (id === null) {
      QueryBuilder.init();
      return;
    }

    var root = QueryHelper.findRoot(query.elements, id);
    var pos = QueryHelper.findElementPosition(root, id);
    activeQmNode = root[pos];

    if (pos === 0) {
      activeQmEdge = null;
    } else {
      if (root[pos - 1] instanceof QM.Edge) {
        activeQmEdge = root[pos - 1];
      }
    }

    notfiyActiveNodeChanged();
  };

  QueryBuilder.getActiveQmNode = function() {
    return activeQmNode;
  };

  QueryBuilder.getActiveQmEdge = function() {
    return activeQmEdge;
  };

  function notfiyActiveNodeChanged() {
    Event.notifyActiveNodeChanged();
  }

  function notifyQueryChanged() {
    $log.log(QueryBuilder.toString());
    Event.notifyQueryChanged();
  }

  QueryBuilder.init();

  return QueryBuilder;
});